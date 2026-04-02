import { useState, useCallback } from "react";

/* ─── tiny helpers ─────────────────────────────────────── */
const s = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "object" ? v : String(v)]));

const badge = (label, color = "#1e2a36") => (
  <span style={{
    background: color,
    color: "#e2eaf2",
    fontSize: 11,
    padding: "1px 7px",
    borderRadius: 3,
    fontFamily: "var(--font-mono)",
    letterSpacing: 0.3,
  }}>
    {label}
  </span>
);

/* ─── KV row ────────────────────────────────────────────── */
function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "0 12px", padding: "5px 0", borderBottom: "1px solid #1a2530" }}>
      <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{label}</span>
      <span style={{ fontFamily: typeof value === "object" ? "var(--font-mono)" : "inherit", fontSize: 12, wordBreak: "break-word", whiteSpace: typeof value === "object" ? "pre-wrap" : "normal" }}>{display}</span>
    </div>
  );
}

/* ─── Concept result card ───────────────────────────────── */
function ConceptCard({ data }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 500, fontSize: 15 }}>
          {data.conceptId}
        </span>
        {data.active !== undefined && badge(data.active ? "ACTIVE" : "INACTIVE", data.active ? "#0d3326" : "#3a1018")}
        {data.definitionStatus?.displayName && badge(data.definitionStatus.displayName, "#1a2840")}
      </div>

      <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 14, color: "var(--text)" }}>
        {data.pt?.term ?? data.fsn?.term ?? "—"}
      </div>

      <Row label="FSN" value={data.fsn?.term} />
      <Row label="Module" value={data.moduleId} />
      <Row label="Effective time" value={data.effectiveTime} />

      {data.descriptions?.length > 0 && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", color: "var(--accent2)", fontWeight: 500, fontSize: 13, listStyle: "none" }}>
            ▸ {data.descriptions.length} description{data.descriptions.length !== 1 ? "s" : ""}
          </summary>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.descriptions.map((d) => (
              <div key={d.descriptionId} style={{ background: "#0d1620", borderRadius: 4, padding: "8px 12px" }}>
                <Row label="Term" value={d.term} />
                <Row label="Type" value={d.typeId} />
                <Row label="Lang" value={d.lang} />
                <Row label="Active" value={String(d.active)} />
              </div>
            ))}
          </div>
        </details>
      )}

      {data.relationships?.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", color: "var(--accent2)", fontWeight: 500, fontSize: 13, listStyle: "none" }}>
            ▸ {data.relationships.length} relationship{data.relationships.length !== 1 ? "s" : ""}
          </summary>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.relationships.map((r, i) => (
              <div key={i} style={{ background: "#0d1620", borderRadius: 4, padding: "8px 12px" }}>
                <Row label="Type" value={r.type?.pt?.term} />
                <Row label="Target" value={r.target?.pt?.term} />
                <Row label="Active" value={String(r.active)} />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* ─── Description result row ───────────────────────────── */
function DescRow({ item, idx }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "12px 16px",
      display: "grid",
      gridTemplateColumns: "24px 1fr",
      gap: "0 12px",
      alignItems: "start",
    }}>
      <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 11, paddingTop: 2 }}>{idx + 1}</span>
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.term}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {badge(item.concept?.conceptId ?? "—", "#1a2840")}
          {item.type?.displayName && badge(item.type.displayName, "#1e2a36")}
          {item.lang && badge(item.lang.toUpperCase(), "#1a3020")}
          {item.active !== undefined && badge(item.active ? "active" : "inactive", item.active ? "#0d3326" : "#3a1018")}
        </div>
        {item.concept?.pt?.term && (
          <div style={{ marginTop: 5, fontSize: 12, color: "var(--muted)" }}>
            Concept: {item.concept.pt.term}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Input component ───────────────────────────────────── */
function SearchInput({ label, placeholder, value, onChange, onSubmit, loading }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: "#0d1620",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "9px 12px",
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          style={{
            background: loading ? "var(--border)" : "var(--accent)",
            color: loading ? "var(--muted)" : "#000",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "9px 18px",
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            fontSize: 13,
            cursor: loading || !value.trim() ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────── */
export default function App() {
  const [conceptId, setConceptId] = useState("73211009");
  const [descTerm, setDescTerm] = useState("diabetes");
  const [descLimit, setDescLimit] = useState("50");

  const [conceptResult, setConceptResult] = useState(null);
  const [descResults, setDescResults] = useState(null);

  const [conceptLoading, setConceptLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);

  const [conceptError, setConceptError] = useState("");
  const [descError, setDescError] = useState("");

  /* fetch concept */
  const fetchConcept = useCallback(async () => {
    if (!conceptId.trim()) return;
    setConceptLoading(true);
    setConceptError("");
    setConceptResult(null);
    try {
      const res = await fetch(`/api/concept?conceptId=${encodeURIComponent(conceptId.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setConceptResult(data);
    } catch (e) {
      setConceptError(e.message);
    } finally {
      setConceptLoading(false);
    }
  }, [conceptId]);

  /* fetch descriptions */
  const fetchDescriptions = useCallback(async () => {
    if (!descTerm.trim()) return;
    setDescLoading(true);
    setDescError("");
    setDescResults(null);
    try {
      const params = new URLSearchParams({
        term: descTerm.trim(),
        groupByConcept: "false",
        searchMode: "STANDARD",
        offset: "0",
        limit: descLimit,
      });
      const res = await fetch(`/api/descriptions?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setDescResults(data);
    } catch (e) {
      setDescError(e.message);
    } finally {
      setDescLoading(false);
    }
  }, [descTerm, descLimit]);

  /* ── render ── */
  return (
    <div style={{ minHeight: "100vh", padding: "0 0 60px" }}>
      {/* header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        position: "sticky",
        top: 0,
        background: "rgba(11,15,20,0.92)",
        backdropFilter: "blur(8px)",
        zIndex: 10,
      }}>
        <div style={{
          width: 8, height: 8,
          background: "var(--accent)",
          borderRadius: "50%",
          boxShadow: "0 0 8px var(--accent)",
        }} />
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 14, letterSpacing: 0.5 }}>
          SNOMED CT Explorer
        </span>
        <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
          MAIN/SNOMEDCT-BE
        </span>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── CONCEPT LOOKUP ── */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
            01 / Concept Lookup
          </h2>

          <SearchInput
            label="Concept ID"
            placeholder="e.g. 73211009"
            value={conceptId}
            onChange={setConceptId}
            onSubmit={fetchConcept}
            loading={conceptLoading}
          />

          {conceptError && (
            <div style={{ marginTop: 12, color: "var(--error)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              ✗ {conceptError}
            </div>
          )}

          {conceptResult && <ConceptCard data={conceptResult} />}
        </section>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 48 }} />

        {/* ── DESCRIPTION SEARCH ── */}
        <section>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
            02 / Description Search
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SearchInput
              label="Search term"
              placeholder="e.g. diabetes"
              value={descTerm}
              onChange={setDescTerm}
              onSubmit={fetchDescriptions}
              loading={descLoading}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>Limit</label>
              <select
                value={descLimit}
                onChange={(e) => setDescLimit(e.target.value)}
                style={{
                  background: "#0d1620",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  padding: "5px 10px",
                }}
              >
                {["10", "25", "50", "100"].map((v) => (
                  <option key={v} value={v}>{v} results</option>
                ))}
              </select>
            </div>
          </div>

          {descError && (
            <div style={{ marginTop: 12, color: "var(--error)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              ✗ {descError}
            </div>
          )}

          {descResults && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
                {descResults.total ?? descResults.items?.length ?? 0} total · showing {descResults.items?.length ?? 0}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(descResults.items ?? []).map((item, i) => (
                  <DescRow key={item.descriptionId ?? i} item={item} idx={i} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}