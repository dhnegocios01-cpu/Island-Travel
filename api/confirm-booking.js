import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { vehicleId, amount, paypalOrderId, payer, equipajeTipo, equipajeCantidad } = req.body;

    const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

    let bookings = [];
    if (fs.existsSync(bookingsFile)) {
      const fileData = fs.readFileSync(bookingsFile, "utf8");
      bookings = fileData ? JSON.parse(fileData) : [];
    }

    const newBooking = {
      id: Date.now(),
      vehicleId,
      amount,
      paypalOrderId,
      payer,
      equipajeTipo,
      equipajeCantidad,
      date: new Date().toISOString()
    };

    bookings.push(newBooking);
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Island Travel" <${process.env.SMTP_USER}>`,
      to: payer.email_address,
      subject: "Confirmación de tu reserva",
      html: `
        <h2>¡Gracias por tu reserva!</h2>
        <p>Pago recibido: <strong>$${amount} USD</strong> para el vehículo <strong>${vehicleId}</strong>.</p>
        <p>ID de transacción PayPal: ${paypalOrderId}</p>
        <p>Equipaje: ${equipajeCantidad} × ${equipajeTipo.replace("_", " ")}</p>
      `
    });

    return res.status(200).json({ message: "Reserva confirmada, guardada y email enviado" });

  } catch (error) {
    console.error("Error en confirm-booking:", error);
    return res.status(500).json({ error: "Error al confirmar la reserva" });
  }
}