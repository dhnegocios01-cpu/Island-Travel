export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const d = req.body || {};
  const FLEET = [
    { id: 'sedan', name: 'Sedán', pax: 3, bags: 3, img: 'https://i.imgur.com/N4rB1HM.jpg', base: 35 },
    { id: 'suv', name: 'SUV', pax: 5, bags: 5, img: 'https://i.imgur.com/3L4d2NB.jpg', base: 55 }
  ];
  const combo = (d.origen || '') + ' ' + (d.destino || '');
  let route = /punta cana|PUJ/i.test(combo) ? 1.0 : 1.2;
  const rt = d.tipo === 'round_trip' ? 1.9 : 1.0;
  const pax = (d.personas || 1) > 4 ? 1.15 : 1.0;
  const vehicles = FLEET.map(v => ({ ...v, price: Math.round(v.base * route * rt * pax) }));
  res.status(200).json({ vehicles });
}