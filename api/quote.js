export default function handler(req, res) {
  // Permitir CORS para Webnode
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder rápido a preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { origen, destino, tipo, personas, fecha, promo } = req.body;

    // Validar campos mínimos
    if (!origen || !destino || !tipo || !personas) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Ejemplo de cálculo de precios (puedes reemplazarlo por tu lógica real)
    const basePrice = 50; // precio base
    const multiplier = tipo === "round_trip" ? 1.8 : 1; // ida y vuelta más caro
    const perPerson = 5; // extra por persona

    const vehicles = [
      {
        id: "sedan",
        nombre: "Sedán",
        precio: basePrice * multiplier + (personas - 1) * perPerson
      },
      {
        id: "suv",
        nombre: "SUV",
        precio: (basePrice + 30) * multiplier + (personas - 1) * perPerson
      },
      {
        id: "van",
        nombre: "Van",
        precio: (basePrice + 50) * multiplier + (personas - 1) * perPerson
      }
    ];

    // Si hay código promocional, aplicar descuento
    if (promo && promo.toLowerCase() === "island10") {
      vehicles.forEach(v => {
        v.precio = Math.round(v.precio * 0.9); // 10% descuento
      });
    }

    return res.status(200).json(vehicles);

  } catch (error) {
    console.error("Error en /api/quote:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}