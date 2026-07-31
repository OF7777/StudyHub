"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/reveal";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteCount, setNoteCount] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [deckCount, setDeckCount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    audioRef.current = new Audio("/Music.mp3");
    audioRef.current.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        fetchNoteCount(user.id);
        fetchBadgeCount(user.id);
        fetchDeckCount(user.id);
        fetchStudyStats(user.id);
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth");
      } else if (session?.user) {
        setUser(session.user);
        fetchNoteCount(session.user.id);
        fetchBadgeCount(session.user.id);
        fetchDeckCount(session.user.id);
        fetchStudyStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const fetchNoteCount = async (userId: string) => {
    const { count } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    
    setNoteCount(count || 0);
  };

  const fetchBadgeCount = async (userId: string) => {
    const { count } = await supabase
      .from("badges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    
    setBadgeCount(count || 0);
  };

  const fetchDeckCount = async (userId: string) => {
    const { count } = await supabase
      .from("flashcard_decks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    
    setDeckCount(count || 0);
  };

  const fetchStudyStats = async (userId: string) => {
    // Fetch study sessions
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    // Calculate total hours
    if (sessions && sessions.length > 0) {
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      setTotalHours(Math.round((totalMinutes / 60) * 10) / 10);
    } else {
      setTotalHours(0);
    }

    // Calculate study streak
    if (sessions && sessions.length > 0) {
      const uniqueDays = new Set<string>();
      sessions.forEach(s => {
        const date = new Date(s.started_at).toDateString();
        uniqueDays.add(date);
      });

      const sortedDays = Array.from(uniqueDays).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedDays.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        if (sortedDays.includes(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }

      setStudyStreak(streak);
    } else {
      setStudyStreak(0);
    }

    // Count subjects from notes
    const { data: notes } = await supabase
      .from("notes")
      .select("subject")
      .eq("user_id", userId)
      .not("subject", "is", null);

    if (notes && notes.length > 0) {
      const uniqueSubjects = new Set(notes.map(n => n.subject).filter(Boolean));
      setSubjectsCount(uniqueSubjects.size);
    } else {
      setSubjectsCount(0);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
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
          <button onClick={toggleMusic} className="music-btn" title={isPlaying ? "Pause music" : "Play music"}>
            {isPlaying ? "🎵" : "🔇"}
          </button>
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
            <Link href="/notes" className="dashboard-card-link">
              <div className="dashboard-card">
                <div className="card-icon" style={{ background: "rgba(202,138,4,0.12)", color: "var(--accent)" }}>
                  &#128221;
                </div>
                <h3>My Notes</h3>
                <p>{noteCount} {noteCount === 1 ? "note" : "notes"}</p>
                <span className="btn btn-outline">View Notes</span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={2}>
            <Link href="/badges" className="dashboard-card-link">
              <div className="dashboard-card">
                <div className="card-icon" style={{ background: "rgba(251,191,36,0.12)", color: "#d97706" }}>
                  🏆
                </div>
                <h3>Badges</h3>
                <p>{badgeCount} {badgeCount === 1 ? "badge" : "badges"} earned</p>
                <span className="btn btn-outline">View Badges</span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={3}>
            <Link href="/progress" className="dashboard-card-link">
              <div className="dashboard-card">
                <div className="card-icon" style={{ background: "rgba(22,163,74,0.1)", color: "var(--green)" }}>
                  &#128200;
                </div>
                <h3>Progress</h3>
                <p>{totalHours} hours studied</p>
                <span className="btn btn-outline">View Stats</span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={4}>
            <Link href="/flashcards" className="dashboard-card-link">
              <div className="dashboard-card">
                <div className="card-icon" style={{ background: "rgba(234,88,12,0.1)", color: "var(--orange)" }}>
                  &#127183;
                </div>
                <h3>Flashcards</h3>
                <p>{deckCount} {deckCount === 1 ? "deck" : "decks"}</p>
                <span className="btn btn-outline">View Decks</span>
              </div>
            </Link>
          </Reveal>

        <Reveal delay={6}>
            <Link href="/timer" className="dashboard-card-link">
              <div className="dashboard-card">
                <div className="card-icon" style={{ background: "rgba(37,99,235,0.1)", color: "var(--blue)" }}>
                  &#9201;
                </div>
                <h3>Timer</h3>
                <p>Start a session</p>
                <button className="btn btn-outline">Start Timer</button>
              </div>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={5}>
          <div className="dashboard-stats">
            <div className="stat-box">
              <div className="stat-value">{studyStreak}</div>
              <div className="stat-label">Study Streak</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalHours}</div>
              <div className="stat-label">Total Hours</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{subjectsCount}</div>
              <div className="stat-label">Subjects</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={7}>
          <div className="quick-actions">
            <Link href="/notes/new" className="btn btn-primary">
              + New Note
            </Link>
            <Link href="/sites" className="btn btn-outline">
              Study Sites
            </Link>
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
        .music-btn {
          background: rgba(202, 138, 4, 0.1);
          border: 1px solid rgba(202, 138, 4, 0.2);
          border-radius: 8px;
          padding: 0.4rem 0.6rem;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .music-btn:hover {
          background: rgba(202, 138, 4, 0.15);
          border-color: rgba(202, 138, 4, 0.3);
          transform: scale(1.05);
        }
        .music-btn:active {
          transform: scale(0.95);
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
        .dashboard-card-link {
          text-decoration: none;
          display: block;
        }
        .quick-actions {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
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
