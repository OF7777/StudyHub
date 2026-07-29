"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/reveal";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

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
        <div className="nav-user">
          <span className="user-email">{user.email}</span>
          <button onClick={handleSignOut} className="btn btn-outline">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <Reveal>
          <div className="dashboard-header">
            <h1>Welcome back!</h1>
            <p>Ready to study today?</p>
          </div>
        </Reveal>

        <div className="dashboard-grid">
          <Reveal delay={1}>
            <div className="dashboard-card">
              <div className="card-icon" style={{ background: "rgba(202,138,4,0.12)", color: "var(--accent)" }}>
                &#128221;
              </div>
              <h3>My Notes</h3>
              <p>0 notes</p>
              <button className="btn btn-outline">Create Note</button>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="dashboard-card">
              <div className="card-icon" style={{ background: "rgba(22,163,74,0.1)", color: "var(--green)" }}>
                &#128200;
              </div>
              <h3>Progress</h3>
              <p>0 hours studied</p>
              <button className="btn btn-outline">View Stats</button>
            </div>
          </Reveal>

          <Reveal delay={3}>
            <div className="dashboard-card">
              <div className="card-icon" style={{ background: "rgba(234,88,12,0.1)", color: "var(--orange)" }}>
                &#127183;
              </div>
              <h3>Flashcards</h3>
              <p>0 decks</p>
              <button className="btn btn-outline">Create Deck</button>
            </div>
          </Reveal>

          <Reveal delay={4}>
            <div className="dashboard-card">
              <div className="card-icon" style={{ background: "rgba(37,99,235,0.1)", color: "var(--blue)" }}>
                &#9201;
              </div>
              <h3>Timer</h3>
              <p>Start a session</p>
              <button className="btn btn-outline">Start Timer</button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={5}>
          <div className="dashboard-stats">
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Study Streak</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Hours</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Subjects</div>
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
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
        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-email {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .dashboard-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .dashboard-header {
          margin-bottom: 3rem;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .dashboard-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 3rem;
        }
        .dashboard-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          transition: all 0.3s;
        }
        .dashboard-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
          border-color: var(--border-hover);
        }
        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          margin-bottom: 1rem;
        }
        .dashboard-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }
        .dashboard-card p {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
        }
        .stat-box {
          text-align: center;
        }
        .stat-box .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.3rem;
        }
        .stat-box .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        @media (max-width: 768px) {
          .nav-user {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }
          .user-email {
            font-size: 0.75rem;
          }
          .dashboard-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
