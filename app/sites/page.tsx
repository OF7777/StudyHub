"use client";

import { useState } from "react";
import Reveal from "@/components/reveal";

interface Site {
  name: string;
  url: string;
  description: string;
}

export default function SitesPage() {
  const [subject, setSubject] = useState("");
  const [sites, setSites] = useState<Site[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setLoading(true);
    setError("");
    setSites(null);

    try {
      const res = await fetch("/api/recommend-sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSites(data.sites);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="section">
        <Reveal>
          <p className="section-label">Study Resources</p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">Find study websites</h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="section-sub">
            Enter a subject to get AI-powered recommendations for the best online resources.
          </p>
        </Reveal>

        <Reveal delay={3}>
          <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "0 auto 3rem", display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Calculus, Spanish, World History..."
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1px solid var(--border-hover)",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                background: "rgba(255,255,255,0.7)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !subject.trim()}
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap" }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </Reveal>

        {error && (
          <div style={{ textAlign: "center", color: "var(--orange)" }}>
            {error}
          </div>
        )}

        {sites && (
          <div className="features-grid" style={{ maxWidth: 700, margin: "0 auto" }}>
            {sites.map((site, i) => (
              <Reveal key={i} delay={Math.min(i, 4)}>
                <div className="feature-card">
                  <h3>{site.name}</h3>
                  <p style={{ marginBottom: "0.5rem" }}>{site.description}</p>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    Visit site &rarr;
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
