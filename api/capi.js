const crypto = require('crypto');

function sha256(val) {
  if (!val) return null;
  const cleaned = String(val).trim().toLowerCase();
  if (!cleaned) return null;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return null;
  // Remove all non-digits
  let digits = String(phone).replace(/\D/g, '');
  // Default to India (91) prefix if 10 digits
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return sha256(digits);
}

module.exports = async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token =
    process.env.META_CAPI_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.FB_ACCESS_TOKEN ||
    process.env.CAPI_TOKEN;

  if (!token) {
    console.error('Meta CAPI access token is missing in environment variables.');
    return res.status(500).json({
      error: 'META_CAPI_TOKEN environment variable is not configured on Vercel.'
    });
  }

  const PIXEL_ID = process.env.META_PIXEL_ID || '39029274246670874';

  try {
    const {
      eventId,
      coupleNames,
      phone,
      email,
      city,
      month,
      insta,
      url
    } = req.body || {};

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';

    const userAgent = req.headers['user-agent'] || '';

    // Extract first name from couple names
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
          event_source_url: url || req.headers.referer || 'https://coolinvites.vercel.app',
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

    const metaUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${token}`;

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI Error:', result);
      return res.status(response.status).json({ success: false, meta_response: result });
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('CAPI Server Exception:', err);
    return res.status(500).json({ error: err.message });
  }
};
