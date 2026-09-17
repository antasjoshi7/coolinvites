const crypto = require('crypto');

function sha256(val) {
  if (!val) return null;
  const cleaned = String(val).trim().toLowerCase();
  if (!cleaned) return null;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return sha256(digits);
}

module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      eventId,
      coupleNames = 'Couple',
      phone = '',
      email = '',
      city = '',
      month = 'TBD',
      insta = '',
      url = '',
      testEventCode = '',
      test_event_code = ''
    } = req.body || {};

    const results = {
      supabase: null,
      email: null,
      meta_capi: null
    };

    // -------------------------------------------------------------
    // 1. SUPABASE DATABASE INSERTION
    // -------------------------------------------------------------
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.replace(/\/$/, '');
        const sbRes = await fetch(`${cleanUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            couple_names: coupleNames,
            phone: phone,
            email: email || null,
            city: city,
            wedding_month: month,
            instagram: insta || null,
            event_id: eventId || null
          })
        });

        if (sbRes.ok) {
          results.supabase = { success: true };
        } else {
          const errText = await sbRes.text();
          console.error('Supabase error:', errText);
          results.supabase = { success: false, error: errText };
        }
      } catch (sbErr) {
        console.error('Supabase connection error:', sbErr);
        results.supabase = { success: false, error: sbErr.message };
      }
    } else {
      results.supabase = { skipped: true, reason: 'SUPABASE_URL or SUPABASE_KEY not set' };
    }

    // -------------------------------------------------------------
    // 2. EMAIL NOTIFICATION (via Resend)
    // -------------------------------------------------------------
    const resendKey = process.env.RESEND_API_KEY;
    const recipient =
      process.env.NOTIFICATION_EMAIL ||
      process.env.LEAD_ALERT_EMAIL ||
      process.env.ALERT_EMAIL ||
      'antasjoshi7@gmail.com';

    if (resendKey && recipient) {
      try {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'The Cool Shaadi Invites <onboarding@resend.dev>',
            to: [recipient],
            subject: `💍 New Lead: ${coupleNames} (${city})`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #1a0620; color: #f5e6c8; border-radius: 12px; border: 1px solid #ff2e7e;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="font-size: 32px; color: #ffb400;">कूल शादी</span>
                  <h2 style="color: #ffb400; margin: 8px 0 0; font-size: 22px;">New Wedding Lead!</h2>
                </div>
                <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                    <tr style="border-bottom: 1px solid rgba(245,230,200,0.15);">
                      <td style="padding: 10px 0; font-weight: 600; color: #ff88b8; width: 40%;">Couple / Name:</td>
                      <td style="padding: 10px 0; color: #ffffff; font-weight: 700;">${coupleNames}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(245,230,200,0.15);">
                      <td style="padding: 10px 0; font-weight: 600; color: #ff88b8;">WhatsApp / Phone:</td>
                      <td style="padding: 10px 0; color: #ffffff; font-weight: 700;">
                        <a href="tel:${phone}" style="color: #ffb400; text-decoration: none;">${phone}</a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(245,230,200,0.15);">
                      <td style="padding: 10px 0; font-weight: 600; color: #ff88b8;">City:</td>
                      <td style="padding: 10px 0; color: #ffffff;">${city}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(245,230,200,0.15);">
                      <td style="padding: 10px 0; font-weight: 600; color: #ff88b8;">Wedding Date:</td>
                      <td style="padding: 10px 0; color: #ffffff;">${month}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(245,230,200,0.15);">
                      <td style="padding: 10px 0; font-weight: 600; color: #ff88b8;">Instagram:</td>
                      <td style="padding: 10px 0; color: #ffffff;">${insta || 'None'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 600; color: #ff88b8;">Received at:</td>
                      <td style="padding: 10px 0; color: #f5e6c8; font-size: 13px;">${istTime} IST</td>
                    </tr>
                  </table>
                </div>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="https://wa.me/${phone.replace(/\D/g, '')}" target="_blank" style="display: inline-block; background: #ff2e7e; color: #1a0620; padding: 14px 28px; font-weight: 700; text-decoration: none; border-radius: 6px; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px;">
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>
            `
          })
        });

        const emailData = await emailRes.json();
        if (emailRes.ok) {
          results.email = { success: true, id: emailData.id };
        } else {
          console.error('Resend error:', emailData);
          results.email = { success: false, error: emailData };
        }
      } catch (emErr) {
        console.error('Email sending error:', emErr);
        results.email = { success: false, error: emErr.message };
      }
    } else {
      results.email = { skipped: true, reason: 'RESEND_API_KEY or NOTIFICATION_EMAIL not set' };
    }

    // -------------------------------------------------------------
    // 3. META CONVERSIONS API (CAPI)
    // -------------------------------------------------------------
    const metaToken =
      process.env.META_CAPI_TOKEN ||
      process.env.META_ACCESS_TOKEN ||
      process.env.FB_ACCESS_TOKEN ||
      process.env.CAPI_TOKEN;

    const PIXEL_ID = process.env.META_PIXEL_ID || '39029274246670874';

    if (metaToken) {
      try {
        const ip =
          req.headers['x-forwarded-for']?.split(',')[0].trim() ||
          req.socket?.remoteAddress ||
          '';

        const userAgent = req.headers['user-agent'] || '';
        const firstName = coupleNames ? coupleNames.split(/[&,+/]/)[0].trim() : '';

        const userData = {
          client_ip_address: ip,
          client_user_agent: userAgent
        };

        const hashedPhone = normalizePhone(phone);
        if (hashedPhone) userData.ph = [hashedPhone];

        const hashedEmail = sha256(email);
        if (hashedEmail) userData.em = [hashedEmail];

        const hashedCity = sha256(city);
        if (hashedCity) userData.ct = [hashedCity];

        const hashedFirstName = sha256(firstName);
        if (hashedFirstName) userData.fn = [hashedFirstName];

        const eventPayload = {
          data: [
            {
              event_name: 'Lead',
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId || 'lead_' + Date.now(),
              event_source_url: url || req.headers.referer || 'https://invitewebsites.vercel.app',
              action_source: 'website',
              user_data: userData,
              custom_data: {
                content_name: 'Wedding Inquiry Form',
                currency: 'INR',
                value: 3999,
                wedding_month: month || 'TBD',
                instagram: insta || 'N/A'
              }
            }
          ]
        };

        const activeTestCode =
          testEventCode ||
          test_event_code ||
          req.query?.test_event_code ||
          process.env.META_TEST_EVENT_CODE;

        if (activeTestCode) {
          eventPayload.test_event_code = activeTestCode;
        }

        const metaUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${metaToken}`;
        const metaRes = await fetch(metaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventPayload)
        });

        const metaJson = await metaRes.json();
        results.meta_capi = { success: metaRes.ok, result: metaJson };
      } catch (metaErr) {
        console.error('Meta CAPI error:', metaErr);
        results.meta_capi = { success: false, error: metaErr.message };
      }
    } else {
      results.meta_capi = { skipped: true, reason: 'META_CAPI_TOKEN not set' };
    }

    return res.status(200).json({
      success: true,
      message: 'Lead received successfully',
      results
    });
  } catch (err) {
    console.error('Lead handler exception:', err);
    return res.status(500).json({ error: err.message });
  }
};
