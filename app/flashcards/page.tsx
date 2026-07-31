"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/reveal";

type Deck = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  cards_count: number;
};

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      fetchDecks();
    };

    checkAuth();
  }, [router, supabase]);

  const fetchDecks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: decksData } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (decksData) {
      const decksWithCounts = await Promise.all(
        decksData.map(async (deck) => {
          const { count } = await supabase
            .from("flashcards")
            .select("*", { count: "exact", head: true })
            .eq("deck_id", deck.id);
          return { ...deck, cards_count: count || 0 };
        })
      );
      setDecks(decksWithCounts);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deck and all its cards?")) return;

    setDeletingId(id);
    const { error } = await supabase.from("flashcard_decks").delete().eq("id", id);

    if (!error) {
      setDecks(decks.filter((d) => d.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-effects">
        <div className="bg-grid"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <nav>
        <Link href="/dashboard" className="logo">
          <div className="logo-icon">S</div>
          Study<span>Hub</span>
        </Link>
        <div className="nav-actions">
          <Link href="/dashboard" className="btn btn-ghost">
            Back to Dashboard
          </Link>
          <Link href="/flashcards/new" className="btn btn-primary">
            + New Deck
          </Link>
        </div>
      </nav>

      <div className="flashcards-container">
        <div className="flashcards-header">
          <h1>Flashcard Decks</h1>
          <p>{decks.length} {decks.length === 1 ? "deck" : "decks"}</p>
        </div>

        {decks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#127183;</div>
            <h3>No flashcard decks yet</h3>
            <p>Create your first deck to start studying</p>
            <Link href="/flashcards/new" className="btn btn-primary">
              Create Deck
            </Link>
          </div>
        ) : (
          <div className="decks-grid">
            {decks.map((deck, index) => (
              <Reveal key={deck.id} delay={index % 5}>
                <div className="deck-card">
                  <Link href={`/flashcards/${deck.id}`} className="deck-link">
                    <h3>{deck.name}</h3>
                    {deck.description && <p>{deck.description}</p>}
                    <span className="deck-meta">
                      {deck.cards_count} {deck.cards_count === 1 ? "card" : "cards"}
                    </span>
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(deck.id)}
                    disabled={deletingId === deck.id}
                  >
                    {deletingId === deck.id ? "..." : "Delete"}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .nav-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .btn-ghost {
          background: transparent;
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .btn-ghost:hover {
          color: var(--text);
          background: rgba(0,0,0,0.04);
        }
        .flashcards-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .flashcards-header {
          margin-bottom: 2rem;
        }
        .flashcards-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .flashcards-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .empty-state h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .empty-state p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .decks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .deck-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }
        .deck-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
          border-color: var(--border-hover);
        }
        .deck-link {
          flex: 1;
          display: block;
          margin-bottom: 1rem;
        }
        .deck-link h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.2px;
          color: var(--text);
        }
        .deck-link p {
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .deck-meta {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 500;
        }
        .delete-btn {
          background: rgba(234, 88, 12, 0.1);
          color: var(--orange);
          border: 1px solid rgba(234, 88, 12, 0.2);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .delete-btn:hover:not(:disabled) {
          background: rgba(234, 88, 12, 0.15);
          border-color: rgba(234, 88, 12, 0.3);
        }
        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
        }
      `}</style>
    </>
  );
}
