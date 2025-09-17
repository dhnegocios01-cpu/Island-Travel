export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { orderId } = req.query;
  const auth = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_SECRET).toString('base64');
  const tokenRes = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const tokenData = await tokenRes.json();
  const captureRes = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' }
  });
  const captureData = await captureRes.json();
  const bookingId = captureData?.purchase_units?.[0]?.custom_id;
  res.status(200).json({ status: captureData.status, bookingId });
}