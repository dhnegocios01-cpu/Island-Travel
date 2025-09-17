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

    // Alias de hoteles, Airbnb, residenciales y lugares → zona principal
    const aliasZonas = {
      // --- BÁVARO ---
      "hard rock hotel": "Hoteles de Bavaro",
      "riu palace bavaro": "Hoteles de Bavaro",
      "riu republica": "Hoteles de Bavaro",
      "riu naiboa": "Hoteles de Bavaro",
      "riu bambu": "Hoteles de Bavaro",
      "barcelo bavaro": "Hoteles de Bavaro",
      "meliá caribe": "Hoteles de Bavaro",
      "paradisus palma real": "Hoteles de Bavaro",
      "secrets royal beach": "Hoteles de Bavaro",
      "dreams royal beach": "Hoteles de Bavaro",
      "occidental punta cana": "Hoteles de Bavaro",
      "grand palladium": "Hoteles de Bavaro",
      "impressive punta cana": "Hoteles de Bavaro",
      "whala bavaro": "Hoteles de Bavaro",
      "vista sol punta cana": "Hoteles de Bavaro",
      "caribe deluxe princess": "Hoteles de Bavaro",
      "tropical deluxe princess": "Hoteles de Bavaro",
      "ocean blue": "Hoteles de Bavaro",
      "los corales": "Hoteles de Bavaro",
      "cortecito": "Hoteles de Bavaro",
      "bibijagua": "Hoteles de Bavaro",
      "plaza turquesa": "Hoteles de Bavaro",
      "residencial el dorado": "Hoteles de Bavaro",
      "airbnb bavaro": "Hoteles de Bavaro",
      "villa bavaro": "Hoteles de Bavaro",
      "apartamento bavaro": "Hoteles de Bavaro",

      // --- MACAO ---
      "macao": "Hoteles de Macao",
      "dreams macao": "Hoteles de Macao",
      "playa macao": "Hoteles de Macao",
      "airbnb macao": "Hoteles de Macao",
      "villa macao": "Hoteles de Macao",

      // --- UVERO ALTO ---
      "uvero alto": "Uvero Alto",
      "excellence el carmen": "Uvero Alto",
      "excellence punta cana": "Uvero Alto",
      "dreams punta cana": "Uvero Alto",
      "nickelodeon hotels": "Uvero Alto",
      "breathless punta cana": "Uvero Alto",
      "zoetry agua": "Uvero Alto",
      "airbnb uvero alto": "Uvero Alto",
      "villa uvero alto": "Uvero Alto",

      // --- ROMANA ---
      "casa de campo": "Romana",
      "altos de chavon": "Romana",
      "la romana": "Romana",
      "hilton la romana": "Romana",
      "dreams la romana": "Romana",
      "bayahibe": "Romana",
      "airbnb romana": "Romana",
      "villa romana": "Romana",

      // --- SANTO DOMINGO ---
      "santo domingo": "Santo Domingo",
      "zona colonial": "Santo Domingo",
      "hotel jaragua": "Santo Domingo",
      "embassy suites": "Santo Domingo",
      "catalonia santo domingo": "Santo Domingo",
      "sheraton santo domingo": "Santo Domingo",
      "gazcue": "Santo Domingo",
      "piantini": "Santo Domingo",
      "naco": "Santo Domingo",
      "bella vista": "Santo Domingo",
      "airbnb santo domingo": "Santo Domingo",
      "apartamento santo domingo": "Santo Domingo"
    };

    let destinoClave = null;

    // 1. Buscar coincidencia directa en la tabla
    destinoClave = Object.keys(tarifasBase).find(key =>
      destino.toLowerCase().includes(key.toLowerCase())
    );

    // 2. Si no hay coincidencia directa, buscar en alias
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