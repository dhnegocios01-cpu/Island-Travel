import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const q = req.body || {};
  const amountUSD = q.amountUSD || 50;
  const bookingId = 'bk_' + Math.random().toString(36).slice(2, 10);
  const pi = await stripe.paymentIntents.create({
    amount: amountUSD * 100,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { bookingId }
  });
  res.status(200).json({ clientSecret: pi.client_secret, bookingId });
}