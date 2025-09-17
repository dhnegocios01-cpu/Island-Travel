export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const q = req.body || {};
  const bookingId = 'bk_' + Math.random().toString(36).slice(2, 10);
  const auth = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_SECRET).toString('base64');
  const tokenRes = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const tokenData = await tokenRes.json();
  const orderRes = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: String(q.amountUSD || 50) }, custom_id: bookingId }]
    })
  });
  const orderData = await orderRes.json();
  res.status(200).json({ orderId: orderData.id, bookingId });
}