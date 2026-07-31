"use client";

import { useState } from "react";
import Link from "next/link";

interface Suggestion {
  original: string;
  replacement: string;
  reason: string;
  type: string;
}

export default function WritingHelperPage() {
  const [essay, setEssay] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!essay.trim()) return;

    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const res = await fetch("/api/writing-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: essay.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuggestions(data.suggestions);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (suggestion: Suggestion) => {
    const newText = essay.replace(suggestion.original, suggestion.replacement);
    setEssay(newText);
    setSuggestions(suggestions.filter((s) => s !== suggestion));
  };

  const handleDecline = (suggestion: Suggestion) => {
    setSuggestions(suggestions.filter((s) => s !== suggestion));
  };

  const typeColors: Record<string, string> = {
    grammar: "var(--orange)",
    style: "var(--blue)",
    clarity: "var(--green)",
    flow: "var(--cyan)",
    wording: "var(--pink)",
  };

  return (
    <>
      <div style={{ padding: "1rem 2rem" }}>
        <Link href="/dashboard" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="section">
        <p className="section-label">Writing Helper</p>
        <h2 className="section-title">AI Essay Editor</h2>
        <p className="section-sub">
          Paste your essay and get AI-powered suggestions to improve grammar, clarity, and style.
        </p>

        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Paste your essay here..."
              rows={15}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                lineHeight: 1.6,
                resize: "vertical",
                background: "rgba(255,255,255,0.7)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
            <button
              onClick={handleAnalyze}
              disabled={loading || !essay.trim()}
              className="btn btn-primary"
              style={{ padding: "0.7rem 1.5rem" }}
            >
              {loading ? "Analyzing..." : "Analyze Essay"}
            </button>
            {essay && (
              <button
                onClick={() => {
                  setEssay("");
                  setSuggestions([]);
                  setError("");
                }}
                className="btn btn-outline"
                style={{ padding: "0.7rem 1.5rem" }}
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div style={{ textAlign: "center", color: "var(--orange)", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
                Suggestions ({suggestions.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1.25rem",
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.25rem 0.6rem",
                          borderRadius: "6px",
                          background: `${typeColors[suggestion.type] || "var(--text-muted)"}20`,
                          color: typeColors[suggestion.type] || "var(--text-muted)",
                          textTransform: "capitalize",
                        }}
                      >
                        {suggestion.type}
                      </span>
                    </div>

                    <div style={{ marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Original:</div>
                      <div
                        style={{
                          padding: "0.6rem 0.8rem",
                          background: "rgba(234,88,12,0.08)",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          borderLeft: "3px solid var(--orange)",
                        }}
                      >
                        {suggestion.original}
                      </div>
                    </div>

                    <div style={{ marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Suggested:</div>
                      <div
                        style={{
                          padding: "0.6rem 0.8rem",
                          background: "rgba(22,163,74,0.08)",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          borderLeft: "3px solid var(--green)",
                        }}
                      >
                        {suggestion.replacement}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", fontStyle: "italic" }}>
                      {suggestion.reason}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleAccept(suggestion)}
                        className="btn btn-primary"
                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleDecline(suggestion)}
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                      >
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length === 0 && !loading && essay && (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              Click "Analyze Essay" to get suggestions
            </div>
          )}
        </div>
      </div>
    </>
  );
}
