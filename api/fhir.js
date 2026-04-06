const FHIR_BASE = "https://snowstorm.ihtsdotools.org/fhir";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Accept");

  if (req.method === "OPTIONS") return res.status(204).end();

  const { path, ...query } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path parameter" });

  const params = new URLSearchParams(query).toString();
  const url = `${FHIR_BASE}/${path}${params ? `?${params}` : ""}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: "application/fhir+json" },
    });
    const data = await upstream.text();
    res.status(upstream.status).setHeader("Content-Type", "application/json").send(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
