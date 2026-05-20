// Server-side Brevo sync triggered by DB inserts (or manual resync from admin).
// Single source of truth: DB row drives Brevo state. Updates sync status back to DB.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALERT_EMAIL = 'karen@firstfloortalent.be'

function normalizePhone(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const compact = value.trim().replace(/[^\d+]/g, '')
  if (!compact) return undefined
  if (compact.startsWith('+')) return compact
  if (compact.startsWith('00')) return `+${compact.slice(2)}`
  if (compact.startsWith('32')) return `+${compact}`
  if (compact.startsWith('0')) return `+32${compact.slice(1)}`
  return undefined
}

function buildConfirmationHtml(voornaam: string, thema: string, moment: string): string {
  const firstName = voornaam.split(' ')[0] || 'daar'
  return `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#315eff;padding:32px 40px;text-align:center;">
<h1 style="color:#ffffff;font-family:'Sora',Arial,sans-serif;font-size:22px;margin:0;">Ronde Tafels</h1>
<p style="color:rgba(255,255,255,0.8);font-size:13px;margin:8px 0 0;letter-spacing:0.1em;text-transform:uppercase;">by First Floor</p>
</td></tr>
<tr><td style="padding:40px;">
<h2 style="font-family:'Sora',Arial,sans-serif;color:#4e5056;font-size:20px;margin:0 0 16px;">Hallo ${firstName},</h2>
<p style="color:#4e5056;font-size:15px;line-height:1.6;margin:0 0 20px;">Bedankt voor je aanvraag voor onze ronde tafel. We hebben je gegevens goed ontvangen!</p>
<table cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-radius:8px;width:100%;margin:0 0 24px;"><tr><td style="padding:20px;">
<p style="margin:0 0 8px;font-size:14px;color:#4e5056;"><strong>Thema:</strong> ${thema}</p>
<p style="margin:0;font-size:14px;color:#4e5056;"><strong>Voorkeur:</strong> ${moment}</p>
</td></tr></table>
<p style="color:#4e5056;font-size:15px;line-height:1.6;margin:0 0 20px;">We bekijken je aanvraag zorgvuldig en laten je persoonlijk weten of deze ronde tafel de juiste match is voor jou. Je hoort zo snel mogelijk van ons.</p>
<p style="color:#71737a;font-size:13px;line-height:1.5;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:20px;">Vragen? Neem gerust contact op via <a href="mailto:karen@firstfloortalent.be" style="color:#315eff;text-decoration:none;">karen@firstfloortalent.be</a></p>
</td></tr>
<tr><td style="background:#f0f4f8;padding:20px 40px;text-align:center;">
<p style="color:#71737a;font-size:12px;margin:0;">© ${new Date().getFullYear()} First Floor · Prins Boudewijnlaan 24C, 2550 Kontich</p>
</td></tr></table></td></tr></table></body></html>`
}

async function sendAlertEmail(apiKey: string, subject: string, details: string) {
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Ronde Tafels sync', email: 'karen@firstfloortalent.be' },
        to: [{ email: ALERT_EMAIL, name: 'Karen' }],
        subject: `⚠️ ${subject}`,
        htmlContent: `<p>Een Brevo-synchronisatie is mislukt. Bekijk admin → resync indien nodig.</p><pre style="background:#f4f4f4;padding:12px;border-radius:6px;white-space:pre-wrap;font-family:monospace;font-size:12px;">${details.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))}</pre>`,
      }),
    })
  } catch (e) {
    console.error('Failed to send alert email:', e)
  }
}

async function syncToBrevo(payload: {
  email: string
  attributes: Record<string, unknown>
  listIds: number[]
  apiKey: string
  sendConfirmation?: boolean
  confirmation?: { thema: string; moment: string }
}): Promise<void> {
  const { email, attributes, listIds, apiKey, sendConfirmation, confirmation } = payload

  const enriched: Record<string, unknown> = {
    ...attributes,
    EXTRA: ['Ronde Tafels'],
    OUTBOUND_CAMPAGNES: ['Ronde Tafel LP'],
  }
  delete enriched.EXT_ID
  delete enriched.TAFEL
  delete enriched.SESSIE
  delete enriched.TOELICHTING

  const phone = normalizePhone(enriched.SMS || enriched.WHATSAPP)
  delete enriched.SMS
  delete enriched.WHATSAPP
  if (phone) {
    enriched.SMS = phone
    enriched.WHATSAPP = phone
  }

  // 1. Create / update contact
  const createRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ email, attributes: enriched, listIds, updateEnabled: true }),
  })
  const createBody = await createRes.text()
  if (!createRes.ok && createRes.status !== 204) {
    if (!createBody.includes('duplicate_parameter')) {
      throw new Error(`Brevo POST /contacts [${createRes.status}]: ${createBody}`)
    }
    // duplicate → PUT update
    const putRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ attributes: enriched, listIds }),
    })
    const putBody = await putRes.text()
    if (!putRes.ok && putRes.status !== 204) {
      throw new Error(`Brevo PUT /contacts [${putRes.status}]: ${putBody}`)
    }
  }

  // 2. Add tag (best-effort)
  try {
    const getRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: { 'api-key': apiKey },
    })
    if (getRes.ok) {
      const info = await getRes.json()
      const tags: string[] = info.tags || []
      if (!tags.includes('RondeTafel')) {
        tags.push('RondeTafel')
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
          body: JSON.stringify({ tags }),
        }).then(r => r.text())
      }
    }
  } catch (e) {
    console.error('Tag sync failed (non-fatal):', e)
  }

  // 3. Send confirmation email (for registrations only)
  if (sendConfirmation && confirmation?.thema && confirmation?.moment) {
    const voornaam = `${attributes.FIRSTNAME || ''} ${attributes.LASTNAME || ''}`.trim()
    const html = buildConfirmationHtml(voornaam, confirmation.thema, confirmation.moment)
    const mailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Ronde Tafels by First Floor', email: 'karen@firstfloortalent.be' },
        to: [{ email, name: voornaam }],
        subject: 'Bedankt voor je aanvraag – Ronde Tafels',
        htmlContent: html,
      }),
    })
    const mailBody = await mailRes.text()
    if (!mailRes.ok) {
      throw new Error(`Brevo POST /smtp/email [${mailRes.status}]: ${mailBody}`)
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!BREVO_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing env config' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY)

  let body: { table?: string; id?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { table, id } = body
  if (!table || !id || (table !== 'registrations' && table !== 'subscribers')) {
    return new Response(JSON.stringify({ error: 'table (registrations|subscribers) and id required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Fetch row
  const { data: row, error: fetchErr } = await admin.from(table).select('*').eq('id', id).maybeSingle()
  if (fetchErr || !row) {
    return new Response(JSON.stringify({ error: `Row not found: ${fetchErr?.message || 'no row'}` }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Build payload per table
  let syncPayload: Parameters<typeof syncToBrevo>[0]
  if (table === 'registrations') {
    const attrs: Record<string, unknown> = {
      FIRSTNAME: (row.voornaam || '').split(' ')[0],
      LASTNAME: (row.voornaam || '').split(' ').slice(1).join(' '),
      BEDRIJF: row.bedrijf,
      JOB_TITLE: row.functie,
      TAFEL: row.thema,
      SESSIE: row.moment,
    }
    if (row.toelichting) attrs.TOELICHTING = row.toelichting
    if (row.telefoon) { attrs.SMS = row.telefoon; attrs.WHATSAPP = row.telefoon }
    syncPayload = {
      email: row.email,
      attributes: attrs,
      listIds: [61],
      apiKey: BREVO_API_KEY,
      sendConfirmation: true,
      confirmation: { thema: row.thema, moment: row.moment },
    }
  } else {
    syncPayload = {
      email: row.email,
      attributes: { FIRSTNAME: row.voornaam || '', LASTNAME: row.achternaam || '' },
      listIds: [60],
      apiKey: BREVO_API_KEY,
    }
  }

  // Increment attempts
  await admin.from(table).update({ brevo_attempts: (row.brevo_attempts || 0) + 1 }).eq('id', id)

  try {
    await syncToBrevo(syncPayload)
    await admin.from(table)
      .update({ brevo_synced_at: new Date().toISOString(), brevo_last_error: null })
      .eq('id', id)
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`Brevo sync failed for ${table}/${id}:`, msg)
    await admin.from(table)
      .update({ brevo_last_error: msg.slice(0, 2000) })
      .eq('id', id)

    // Alert
    const details = `Tabel: ${table}\nID: ${id}\nE-mail: ${row.email}\nNaam: ${row.voornaam || ''} ${row.achternaam || ''}\nFout:\n${msg}`
    await sendAlertEmail(BREVO_API_KEY, `Brevo-sync mislukt (${table})`, details)

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
