const BASE = "https://snowstorm.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN%2FSNOMEDCT-BE";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const {
    term = "",
    groupByConcept = "false",
    searchMode = "STANDARD",
    offset = "0",
    limit = "50",
  } = req.query;

  if (!term) return res.status(400).json({ error: "term is required" });

  const params = new URLSearchParams({ term, groupByConcept, searchMode, offset, limit });
  const url = `${BASE}/descriptions?${params}`;

  try {
    console.log("Fetching:", url);

    const upstream = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "snomed-explorer/1.0",
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("Upstream error:", upstream.status, text.slice(0, 200));
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`,
        detail: text.slice(0, 300),
      });
    }

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      console.error("Non-JSON response:", text.slice(0, 200));
      return res.status(502).json({ error: "Upstream returned non-JSON", detail: text.slice(0, 300) });
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}