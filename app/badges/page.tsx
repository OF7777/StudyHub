"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/reveal";
import { BADGE_DEFINITIONS, type Badge } from "@/lib/badges";

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      fetchBadges();
    };

    checkAuth();
  }, [router, supabase]);

  const fetchBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("badges")
      .select("*")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false });

    if (data) {
      setEarnedBadges(data);
    }
    setLoading(false);
  };

  const earnedTypes = new Set(earnedBadges.map((b) => b.badge_type));

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
          <Link href="/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="badges-container">
        <Reveal>
          <div className="badges-header">
            <h1>Your Badges</h1>
            <p>
              {earnedBadges.length} of {BADGE_DEFINITIONS.length} badges earned
            </p>
          </div>
        </Reveal>

        <div className="badges-section">
          <Reveal>
            <h2 className="section-heading">
              Earned ({earnedBadges.length})
            </h2>
          </Reveal>

          {earnedBadges.length === 0 ? (
            <Reveal delay={1}>
              <div className="empty-state">
                <div className="empty-icon">🏆</div>
                <h3>No badges yet</h3>
                <p>Start studying to earn your first badge!</p>
              </div>
            </Reveal>
          ) : (
            <div className="badges-grid">
              {earnedBadges.map((badge, index) => (
                <Reveal key={badge.id} delay={index % 5}>
                  <div className="badge-card earned">
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-info">
                      <h3>{badge.name}</h3>
                      <p>{badge.description}</p>
                      <span className="badge-date">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="badges-section">
          <Reveal>
            <h2 className="section-heading">
              Locked ({BADGE_DEFINITIONS.length - earnedBadges.length})
            </h2>
          </Reveal>

          <div className="badges-grid">
            {BADGE_DEFINITIONS.filter((def) => !earnedTypes.has(def.type)).map(
              (def, index) => (
                <Reveal key={def.type} delay={index % 5}>
                  <div className="badge-card locked">
                    <div className="badge-icon">{def.icon}</div>
                    <div className="badge-info">
                      <h3>{def.name}</h3>
                      <p>{def.description}</p>
                      <span className="badge-status">🔒 Locked</span>
                    </div>
                  </div>
                </Reveal>
              )
            )}
          </div>
        </div>
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
        .badges-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .badges-header {
          margin-bottom: 3rem;
        }
        .badges-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .badges-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .badges-section {
          margin-bottom: 3rem;
        }
        .section-heading {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
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
        }
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .badge-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          transition: all 0.3s;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .badge-card.earned {
          border-color: rgba(202, 138, 4, 0.3);
          box-shadow: 0 4px 20px rgba(202, 138, 4, 0.1);
        }
        .badge-card.earned:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(202, 138, 4, 0.15);
        }
        .badge-card.locked {
          opacity: 0.6;
        }
        .badge-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }
        .badge-info {
          flex: 1;
        }
        .badge-info h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }
        .badge-info p {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .badge-date {
          font-size: 0.75rem;
          color: var(--accent);
          font-weight: 600;
        }
        .badge-status {
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .badges-container {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </>
  );
}
