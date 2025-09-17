import aliasZonas from "../Data/aliaszonas.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { origen, destino, tipo, personas, equipajeTipo, equipajeCantidad } = req.body;

    if (!origen || !destino || !tipo || !personas) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Tarifas base (1-4 personas)
    const tarifasBase = {
      "Hoteles de Bavaro": 35,
      "Hoteles de Macao": 60,
      "Uvero Alto": 70,
      "Romana": 120,
      "Santo Domingo": 180
    };

    // Extra por persona adicional (>4)
    const tarifasExtra = {
      "Hoteles de Bavaro": 5,
      "Hoteles de Macao": 7,
      "Uvero Alto": 10,
      "Romana": 20,
      "Santo Domingo": 25
    };

    let destinoClave = Object.keys(tarifasBase).find(key =>
      destino.toLowerCase().includes(key.toLowerCase())
    );

    if (!destinoClave) {
      for (let alias in aliasZonas) {
        if (destino.toLowerCase().includes(alias)) {
          destinoClave = aliasZonas[alias];
          break;
        }
      }
    }

    if (!destinoClave) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }

    // Calcular precio base según personas
    let precioBase = tarifasBase[destinoClave];
    if (personas > 4) {
      precioBase += (personas - 4) * tarifasExtra[destinoClave];
    }

    // Extra por equipaje
    let equipajeExtra = 0;
    if (equipajeTipo === "maleta_grande") equipajeExtra = 5 * equipajeCantidad;
    if (equipajeTipo === "maleta_mediana") equipajeExtra = 3 * equipajeCantidad;
    if (equipajeTipo === "maleta_pequena" || equipajeTipo === "mochila") equipajeExtra = 1 * equipajeCantidad;

    // Ajuste por tipo de servicio
    const multiplier = tipo === "round_trip" ? 1.8 : 1;

    const vehicles = [
      { id: "sedan", nombre: "Sedán", precio: (precioBase + equipajeExtra) * multiplier },
      { id: "suv", nombre: "SUV", precio: (precioBase + 30 + equipajeExtra) * multiplier },
      { id: "van", nombre: "Van", precio: (precioBase + 50 + equipajeExtra) * multiplier }
    ];

    return res.status(200).json(vehicles);

  } catch (error) {
    console.error("Error en /api/quote:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}