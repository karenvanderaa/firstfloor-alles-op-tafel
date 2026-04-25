const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildConfirmationHtml(voornaam: string, thema: string, moment: string): string {
  const firstName = voornaam.split(' ')[0] || 'daar'
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#315eff;padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;font-family:'Sora',Arial,sans-serif;font-size:22px;margin:0;">
            Ronde Tafels
          </h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:8px 0 0;letter-spacing:0.1em;text-transform:uppercase;">
            by First Floor
          </p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="font-family:'Sora',Arial,sans-serif;color:#4e5056;font-size:20px;margin:0 0 16px;">
            Hallo ${firstName},
          </h2>
          <p style="color:#4e5056;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Bedankt voor je aanvraag voor onze ronde tafel. We hebben je gegevens goed ontvangen!
          </p>
          <table cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-radius:8px;width:100%;margin:0 0 24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#4e5056;">
                <strong>Thema:</strong> ${thema}
              </p>
              <p style="margin:0;font-size:14px;color:#4e5056;">
                <strong>Voorkeur:</strong> ${moment}
              </p>
            </td></tr>
          </table>
          <p style="color:#4e5056;font-size:15px;line-height:1.6;margin:0 0 20px;">
            We bekijken je aanvraag zorgvuldig en laten je persoonlijk weten of deze ronde tafel de juiste match is voor jou. Je hoort zo snel mogelijk van ons.
          </p>
          <p style="color:#71737a;font-size:13px;line-height:1.5;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:20px;">
            Vragen? Neem gerust contact op via 
            <a href="mailto:karen@firstfloortalent.be" style="color:#315eff;text-decoration:none;">karen@firstfloortalent.be</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f0f4f8;padding:20px 40px;text-align:center;">
          <p style="color:#71737a;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} First Floor · Prins Boudewijnlaan 24C, 2550 Kontich
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
  if (!BREVO_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'BREVO_API_KEY is not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { email, attributes, listIds, updateEnabled, ext_id, sendConfirmation, confirmation } = body

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Create/update contact — OUTBOUND_CAMPAGNES is multi-choice in Brevo (array).
    const enrichedAttributes = { ...(attributes || {}), OUTBOUND_CAMPAGNES: ['Ronde Tafel LP'] }

    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: enrichedAttributes,
        listIds: listIds || [],
        updateEnabled: updateEnabled ?? true,
        ext_id: ext_id || undefined,
      }),
    })

    const contactData = await contactResponse.text()

    if (!contactResponse.ok && contactResponse.status !== 204) {
      const isDuplicate = contactData.includes('duplicate_parameter')
      if (!isDuplicate) {
        console.error(`Brevo contact API error [${contactResponse.status}]: ${contactData}`)
        return new Response(
          JSON.stringify({ error: 'Failed to create contact', details: contactData }),
          { status: contactResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Contact exists — update attributes and add to list via PUT
      console.log('Contact already exists, updating via PUT')
      const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          attributes: enrichedAttributes,
          listIds: listIds || [],
        }),
      })
      const updateData = await updateResponse.text()
      if (!updateResponse.ok && updateResponse.status !== 204) {
        console.error(`Brevo update API error [${updateResponse.status}]: ${updateData}`)
      } else {
        console.log('Contact updated successfully')
      }
    }

    // 2. Add "RondeTafel" tag via Brevo's manage process endpoint
    try {
      // First, get the contact to retrieve their ID
      const getContactRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'api-key': BREVO_API_KEY },
      })
      if (getContactRes.ok) {
        const contactInfo = await getContactRes.json()
        // Use PUT to update contact with tags (Brevo expects tags as array of strings on contact update)
        // Merge existing tags with new tag
        const existingTags: string[] = contactInfo.tags || []
        if (!existingTags.includes('RondeTafel')) {
          existingTags.push('RondeTafel')
        }
        const tagUpdateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
          },
          body: JSON.stringify({ tags: existingTags }),
        })
        if (!tagUpdateRes.ok && tagUpdateRes.status !== 204) {
          console.error(`Brevo tag update error [${tagUpdateRes.status}]: ${await tagUpdateRes.text()}`)
        } else {
          console.log('Tag RondeTafel added successfully')
        }
      } else {
        console.error(`Could not fetch contact for tagging: ${getContactRes.status}`)
      }
    } catch (tagErr) {
      console.error('Failed to add tag:', tagErr)
    }

    // 3. Send confirmation email if requested
    if (sendConfirmation && confirmation?.thema && confirmation?.moment) {
      try {
        const voornaam = `${attributes?.FIRSTNAME || ''} ${attributes?.LASTNAME || ''}`.trim()
        const emailHtml = buildConfirmationHtml(voornaam, confirmation.thema, confirmation.moment)

        const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: 'Ronde Tafels by First Floor', email: 'karen@firstfloortalent.be' },
            to: [{ email, name: voornaam }],
            subject: 'Bedankt voor je aanvraag – Ronde Tafels',
            htmlContent: emailHtml,
          }),
        })

        const emailData = await emailResponse.text()
        if (!emailResponse.ok) {
          console.error(`Brevo email API error [${emailResponse.status}]: ${emailData}`)
        }
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
        // Don't fail the whole request if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in brevo-contact:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
