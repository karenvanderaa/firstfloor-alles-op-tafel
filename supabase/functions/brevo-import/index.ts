import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BrevoContact {
  email: string
  attributes: Record<string, unknown>
  tags?: string[]
  modifiedAt?: string
}

interface MappedRow {
  email: string
  voornaam: string
  bedrijf: string
  functie: string
  telefoon: string | null
  thema: string
  moment: string
  toelichting: string | null
}

function pickStr(attrs: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = attrs?.[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return ''
}

function mapContact(c: BrevoContact): { row: MappedRow | null; missing: string[] } {
  const a = c.attributes || {}
  const firstName = pickStr(a, 'FIRSTNAME', 'VOORNAAM')
  const lastName = pickStr(a, 'LASTNAME', 'NAAM', 'ACHTERNAAM')
  const voornaam = `${firstName} ${lastName}`.trim()
  const bedrijf = pickStr(a, 'COMPANY', 'BEDRIJF', 'ORGANISATIE')
  const functie = pickStr(a, 'JOB_TITLE', 'FUNCTIE', 'TITLE', 'ROL')
  const thema = pickStr(a, 'TAFEL', 'THEMA')
  const moment = pickStr(a, 'SESSIE', 'MOMENT')
  const toelichting = pickStr(a, 'TOELICHTING', 'NOTES', 'NOTE')
  const telefoon = pickStr(a, 'SMS', 'WHATSAPP', 'PHONE', 'TELEFOON', 'GSM')

  const missing: string[] = []
  if (!voornaam) missing.push('voornaam (FIRSTNAME/LASTNAME)')
  if (!bedrijf) missing.push('bedrijf (COMPANY)')
  if (!functie) missing.push('functie (JOB_TITLE)')
  if (!thema) missing.push('thema (TAFEL)')
  if (!moment) missing.push('moment (SESSIE)')

  if (missing.length) return { row: null, missing }

  return {
    row: {
      email: c.email,
      voornaam,
      bedrijf,
      functie,
      telefoon: telefoon || null,
      thema,
      moment,
      toelichting: toelichting || null,
    },
    missing: [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'BREVO_API_KEY niet geconfigureerd' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Verify caller is authenticated admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Niet ingelogd' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Ongeldige sessie' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: roleCheck } = await admin
      .from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle()
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Geen admin-rechten' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Fetch contacts from Brevo list #61 (paginate)
    const LIST_ID = 61
    const allContacts: BrevoContact[] = []
    let offset = 0
    const limit = 100
    const maxPages = 20 // safety cap = 2000 contacts

    for (let page = 0; page < maxPages; page++) {
      const url = `https://api.brevo.com/v3/contacts/lists/${LIST_ID}/contacts?limit=${limit}&offset=${offset}&sort=desc`
      const resp = await fetch(url, { headers: { 'api-key': BREVO_API_KEY } })
      if (!resp.ok) {
        const txt = await resp.text()
        console.error(`Brevo list error [${resp.status}]: ${txt}`)
        return new Response(JSON.stringify({ error: 'Brevo API fout', details: txt }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const data = await resp.json()
      const contacts: BrevoContact[] = data.contacts || []
      allContacts.push(...contacts)
      if (contacts.length < limit) break
      offset += limit
    }

    console.log(`Fetched ${allContacts.length} contacts from Brevo list #${LIST_ID}`)

    // 3. All contacts in this list are candidates
    const candidates = allContacts

    console.log(`${candidates.length} contacts match RondeTafel filter`)

    // 4. Map and split
    const toUpsert: MappedRow[] = []
    const skipped: { email: string; missing: string[] }[] = []
    for (const c of candidates) {
      const { row, missing } = mapContact(c)
      if (row) toUpsert.push(row)
      else skipped.push({ email: c.email, missing })
    }

    // 5. Fetch existing rows so admin edits (status/notitie) are preserved
    let imported = 0
    let updated = 0
    const errors: string[] = []

    for (const row of toUpsert) {
      const { data: existing } = await admin
        .from('registrations')
        .select('id, voornaam, bedrijf, functie, telefoon, toelichting')
        .eq('email', row.email)
        .eq('thema', row.thema)
        .maybeSingle()

      if (existing) {
        // Only fill empty fields, never overwrite admin-curated data nor status/notitie
        const patch: Record<string, unknown> = {}
        if (!existing.voornaam && row.voornaam) patch.voornaam = row.voornaam
        if (!existing.bedrijf && row.bedrijf) patch.bedrijf = row.bedrijf
        if (!existing.functie && row.functie) patch.functie = row.functie
        if (!existing.telefoon && row.telefoon) patch.telefoon = row.telefoon
        if (!existing.toelichting && row.toelichting) patch.toelichting = row.toelichting

        if (Object.keys(patch).length > 0) {
          const { error } = await admin.from('registrations').update(patch).eq('id', existing.id)
          if (error) errors.push(`${row.email}: ${error.message}`)
          else updated++
        }
      } else {
        const { error } = await admin.from('registrations').insert(row)
        if (error) errors.push(`${row.email}: ${error.message}`)
        else imported++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalFetched: allContacts.length,
        candidates: candidates.length,
        imported,
        updated,
        skipped,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('brevo-import error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
