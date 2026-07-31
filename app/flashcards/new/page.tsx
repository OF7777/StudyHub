"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Card = {
  front: string;
  back: string;
};

export default function NewDeckPage() {
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [cards, setCards] = useState<Card[]>([{ front: "", back: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      }
    };
    checkAuth();
  }, [router, supabase]);

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const removeCard = (index: number) => {
    if (cards.length === 1) return;
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const handleSave = async () => {
    if (!deckName.trim()) {
      setError("Please enter a deck name");
      return;
    }

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError("Please add at least one complete card");
      return;
    }

    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in");
      setSaving(false);
      return;
    }

    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: user.id,
        name: deckName.trim(),
        description: deckDescription.trim() || null,
      })
      .select()
      .single();

    if (deckError || !deck) {
      setError("Failed to create deck");
      setSaving(false);
      return;
    }

    const cardsToInsert = validCards.map((c) => ({
      deck_id: deck.id,
      front: c.front.trim(),
      back: c.back.trim(),
    }));

    const { error: cardsError } = await supabase
      .from("flashcards")
      .insert(cardsToInsert);

    if (cardsError) {
      setError("Failed to save cards");
      setSaving(false);
    } else {
      router.push("/flashcards");
    }
  };

  return (
    <>
      <div className="bg-effects">
        <div className="bg-grid"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <nav>
        <Link href="/flashcards" className="logo">
          <div className="logo-icon">S</div>
          Study<span>Hub</span>
        </Link>
        <div className="nav-actions">
          <Link href="/flashcards" className="btn btn-outline">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : "Save Deck"}
          </button>
        </div>
      </nav>

      <div className="new-deck-container">
        <div className="deck-form-card">
          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            placeholder="Deck name..."
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="deck-name-input"
            autoFocus
          />

          <input
            type="text"
            placeholder="Description (optional)"
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            className="deck-desc-input"
          />

          <div className="cards-section">
            <h3>Cards ({cards.length})</h3>

            {cards.map((card, index) => (
              <div key={index} className="card-editor">
                <div className="card-header">
                  <span className="card-number">Card {index + 1}</span>
                  {cards.length > 1 && (
                    <button onClick={() => removeCard(index)} className="remove-card-btn">
                      Remove
                    </button>
                  )}
                </div>
                <div className="card-fields">
                  <div className="card-field">
                    <label>Front</label>
                    <textarea
                      placeholder="Question or term..."
                      value={card.front}
                      onChange={(e) => updateCard(index, "front", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="card-field">
                    <label>Back</label>
                    <textarea
                      placeholder="Answer or definition..."
                      value={card.back}
                      onChange={(e) => updateCard(index, "back", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addCard} className="add-card-btn">
              + Add Card
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .new-deck-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .deck-form-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
        .error-message {
          background: rgba(234, 88, 12, 0.1);
          color: var(--orange);
          border: 1px solid rgba(234, 88, 12, 0.2);
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .deck-name-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 1.6rem;
          font-weight: 800;
          font-family: inherit;
          letter-spacing: -0.5px;
          background: transparent;
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .deck-name-input::placeholder {
          color: var(--text-dim);
        }
        .deck-desc-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 0.95rem;
          font-family: inherit;
          background: transparent;
          margin-bottom: 2rem;
          color: var(--text-muted);
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .deck-desc-input::placeholder {
          color: var(--text-dim);
        }
        .cards-section h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text);
        }
        .card-editor {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .card-number {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
        }
        .remove-card-btn {
          background: none;
          border: none;
          color: var(--orange);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }
        .remove-card-btn:hover {
          text-decoration: underline;
        }
        .card-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .card-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .card-field textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
          font-size: 0.9rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.6);
          resize: vertical;
          color: var(--text);
        }
        .card-field textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }
        .add-card-btn {
          width: 100%;
          padding: 0.75rem;
          background: rgba(202, 138, 4, 0.08);
          border: 1px dashed rgba(202, 138, 4, 0.3);
          border-radius: 10px;
          color: var(--accent);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          margin-top: 0.5rem;
        }
        .add-card-btn:hover {
          background: rgba(202, 138, 4, 0.12);
          border-color: rgba(202, 138, 4, 0.4);
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .new-deck-container {
            padding: 1rem;
          }
          .deck-form-card {
            padding: 1.5rem;
          }
          .card-fields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
