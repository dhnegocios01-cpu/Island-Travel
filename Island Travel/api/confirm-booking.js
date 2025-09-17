import nodemailer from 'nodemailer';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { bookingId } = req.query;
  const { quote } = req.body || {};
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `Reserva confirmada #${bookingId}`,
      html: `<h2>Reserva confirmada</h2><p>${JSON.stringify(quote)}</p>`
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}