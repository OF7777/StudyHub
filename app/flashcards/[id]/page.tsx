"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Card = {
  id: string;
  front: string;
  back: string;
};

type Deck = {
  id: string;
  name: string;
  description: string;
};

export default function StudyDeckPage() {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studyComplete, setStudyComplete] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: deckData } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (!deckData) {
        router.push("/flashcards");
        return;
      }

      setDeck(deckData);

      const { data: cardsData } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckData.id);

      if (cardsData) {
        setCards(cardsData);
      }
      setLoading(false);
    };

    fetchData();
  }, [params.id, router, supabase]);

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setStudyComplete(true);
    }
  }, [currentIndex, cards.length]);

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudyComplete(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (studyComplete) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === "ArrowRight") {
        nextCard();
      } else if (e.key === "ArrowLeft") {
        prevCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, nextCard, studyComplete]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!deck || cards.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-card">
          <h2>No cards in this deck</h2>
          <p>Add some cards to start studying</p>
          <Link href="/flashcards" className="btn btn-outline">
            Back to Decks
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

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
            Back to Decks
          </Link>
        </div>
      </nav>

      <div className="study-container">
        <div className="study-header">
          <h1>{deck.name}</h1>
          <p>
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>

        {studyComplete ? (
          <div className="complete-card">
            <div className="complete-icon">&#127881;</div>
            <h2>Deck Complete!</h2>
            <p>You&apos;ve reviewed all {cards.length} cards</p>
            <div className="complete-actions">
              <button onClick={restart} className="btn btn-primary">
                Study Again
              </button>
              <Link href="/flashcards" className="btn btn-outline">
                Back to Decks
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`flashcard ${isFlipped ? "flipped" : ""}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <span className="card-label">Question</span>
                  <p>{currentCard.front}</p>
                  <span className="tap-hint">Click or press Space to flip</span>
                </div>
                <div className="flashcard-back">
                  <span className="card-label">Answer</span>
                  <p>{currentCard.back}</p>
                  <span className="tap-hint">Click to flip back</span>
                </div>
              </div>
            </div>

            <div className="study-controls">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="btn btn-outline"
              >
                &#8592; Previous
              </button>
              <button onClick={nextCard} className="btn btn-primary">
                {currentIndex === cards.length - 1 ? "Finish" : "Next &#8594;"}
              </button>
            </div>

            <div className="keyboard-hints">
              <span>Space: Flip</span>
              <span>&#8592;: Previous</span>
              <span>&#8594;: Next</span>
            </div>
          </>
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
        .empty-container {
          min-height: calc(100vh - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .empty-card {
          text-align: center;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 3rem 2rem;
        }
        .empty-card h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .empty-card p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .nav-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .study-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .study-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .study-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .study-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .flashcard {
          perspective: 1000px;
          height: 300px;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flashcard.flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
          text-align: center;
        }
        .flashcard-back {
          transform: rotateY(180deg);
          background: rgba(202, 138, 4, 0.05);
          border-color: rgba(202, 138, 4, 0.2);
        }
        .card-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          margin-bottom: 1rem;
        }
        .flashcard-front p,
        .flashcard-back p {
          font-size: 1.3rem;
          font-weight: 600;
          line-height: 1.5;
          color: var(--text);
          flex: 1;
          display: flex;
          align-items: center;
        }
        .tap-hint {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 1rem;
        }
        .study-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .study-controls .btn {
          min-width: 120px;
          justify-content: center;
        }
        .keyboard-hints {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .complete-card {
          text-align: center;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 3rem 2rem;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
        }
        .complete-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .complete-card h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .complete-card p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .complete-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .study-container {
            padding: 1.5rem 1rem;
          }
          .flashcard {
            height: 250px;
          }
          .flashcard-front p,
          .flashcard-back p {
            font-size: 1.1rem;
          }
          .keyboard-hints {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
