import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BrevoContact {
  email: string
  attributes: Record<string, unknown>
  tags?: string[]
}

interface MappedRegistration {
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

function bedrijfFromEmail(email: string): string {
  const domain = email.split('@')[1] || ''
  const name = domain.split('.')[0] || ''
  if (!name) return 'Onbekend'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function themaFromExtId(extId: string): string {
  // bv. "ronde-tafel-ai-hr" -> "ai-hr"; "ronde-tafel-verandering" -> "verandering"
  return extId.replace(/^ronde-tafel-/, '').trim()
}

function mapRegistration(c: BrevoContact): { row: MappedRegistration | null; missing: string[] } {
  const a = c.attributes || {}
  const firstName = pickStr(a, 'FIRSTNAME', 'VOORNAAM')
  const lastName = pickStr(a, 'LASTNAME', 'NAAM', 'ACHTERNAAM')
  const voornaam = `${firstName} ${lastName}`.trim() || c.email
  const bedrijfRaw = pickStr(a, 'COMPANY', 'BEDRIJF', 'ORGANISATIE')
  const bedrijf = bedrijfRaw || bedrijfFromEmail(c.email)
  const functie = pickStr(a, 'JOB_TITLE', 'FUNCTIE', 'TITLE', 'ROL') || 'Onbekend'
  const extId = pickStr(a, 'EXT_ID')
  const thema = pickStr(a, 'TAFEL', 'THEMA') || (extId ? themaFromExtId(extId) : '')
  const moment = pickStr(a, 'SESSIE', 'MOMENT') || 'Nog te bepalen'
  const toelichting = pickStr(a, 'TOELICHTING', 'NOTES', 'NOTE')
  const telefoon = pickStr(a, 'SMS', 'WHATSAPP', 'PHONE', 'TELEFOON', 'GSM')

  const missing: string[] = []
  if (!c.email) missing.push('email')

  if (missing.length) return { row: null, missing }

  // Fallback: als geen thema bekend is, importeer als "onbekend" zodat de admin
  // het contact ziet en handmatig een thema kan toekennen.
  const finalThema = thema || 'onbekend'
  const finalMoment = moment || 'Nog te bepalen'

  return {
    row: { email: c.email, voornaam, bedrijf, functie, telefoon: telefoon || null, thema: finalThema, moment: finalMoment, toelichting: toelichting || null },
    missing: [],
  }
}

async function fetchList(brevoKey: string, listId: number): Promise<BrevoContact[]> {
  const all: BrevoContact[] = []
  let offset = 0
  const limit = 100
  for (let page = 0; page < 20; page++) {
    const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}&sort=desc`
    const resp = await fetch(url, { headers: { 'api-key': brevoKey } })
    if (!resp.ok) {
      const txt = await resp.text()
      throw new Error(`Brevo list ${listId} error [${resp.status}]: ${txt}`)
    }
    const data = await resp.json()
    const contacts: BrevoContact[] = data.contacts || []
    all.push(...contacts)
    if (contacts.length < limit) break
    offset += limit
  }
  return all
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

    // 1. Verify admin
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

    // 2. Fetch both lists from Brevo
    const [registrationsContacts, subscribersContacts] = await Promise.all([
      fetchList(BREVO_API_KEY, 61),
      fetchList(BREVO_API_KEY, 60),
    ])
    console.log(`List #61 (inschrijvingen): ${registrationsContacts.length} contacts`)
    console.log(`List #60 (op de hoogte): ${subscribersContacts.length} contacts`)

    // 3a. Process registrations (list #61)
    const regToUpsert: MappedRegistration[] = []
    const regSkipped: { email: string; missing: string[] }[] = []
    for (const c of registrationsContacts) {
      const { row, missing } = mapRegistration(c)
      if (row) regToUpsert.push(row)
      else regSkipped.push({ email: c.email, missing })
    }

    let regImported = 0, regUpdated = 0
    const regErrors: string[] = []
    for (const row of regToUpsert) {
      const { data: existing } = await admin
        .from('registrations')
        .select('id, voornaam, bedrijf, functie, telefoon, toelichting')
        .eq('email', row.email).eq('thema', row.thema).maybeSingle()

      if (existing) {
        const patch: Record<string, unknown> = {}
        if (!existing.voornaam && row.voornaam) patch.voornaam = row.voornaam
        if (!existing.bedrijf && row.bedrijf) patch.bedrijf = row.bedrijf
        if (!existing.functie && row.functie) patch.functie = row.functie
        if (!existing.telefoon && row.telefoon) patch.telefoon = row.telefoon
        if (!existing.toelichting && row.toelichting) patch.toelichting = row.toelichting
        if (Object.keys(patch).length > 0) {
          const { error } = await admin.from('registrations').update(patch).eq('id', existing.id)
          if (error) regErrors.push(`${row.email}: ${error.message}`)
          else regUpdated++
        }
      } else {
        const { error } = await admin.from('registrations').insert(row)
        if (error) regErrors.push(`${row.email}: ${error.message}`)
        else regImported++
      }
    }

    // 3b. Process subscribers (list #60) — only e-mail required
    let subImported = 0, subUpdated = 0
    const subErrors: string[] = []
    for (const c of subscribersContacts) {
      if (!c.email) continue
      const a = c.attributes || {}
      const voornaam = pickStr(a, 'FIRSTNAME', 'VOORNAAM')
      const achternaam = pickStr(a, 'LASTNAME', 'NAAM', 'ACHTERNAAM')

      const { data: existing } = await admin
        .from('subscribers').select('id, voornaam, achternaam').eq('email', c.email).maybeSingle()

      if (existing) {
        const patch: Record<string, unknown> = {}
        if (!existing.voornaam && voornaam) patch.voornaam = voornaam
        if (!existing.achternaam && achternaam) patch.achternaam = achternaam
        if (Object.keys(patch).length > 0) {
          const { error } = await admin.from('subscribers').update(patch).eq('id', existing.id)
          if (error) subErrors.push(`${c.email}: ${error.message}`)
          else subUpdated++
        }
      } else {
        const { error } = await admin.from('subscribers').insert({
          email: c.email,
          voornaam: voornaam || null,
          achternaam: achternaam || null,
        })
        if (error) subErrors.push(`${c.email}: ${error.message}`)
        else subImported++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        registrations: {
          fetched: registrationsContacts.length,
          imported: regImported,
          updated: regUpdated,
          skipped: regSkipped,
          errors: regErrors,
        },
        subscribers: {
          fetched: subscribersContacts.length,
          imported: subImported,
          updated: subUpdated,
          errors: subErrors,
        },
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
