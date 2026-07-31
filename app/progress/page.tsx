"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type StudySession = {
  id: string;
  subject: string | null;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
};

type SubjectStats = {
  subject: string;
  total_minutes: number;
  sessions: number;
};

export default function ProgressPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      fetchProgress(user.id);
    };

    checkAuth();
  }, [router, supabase]);

  const fetchProgress = async (userId: string) => {
    const { data: sessionsData } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (sessionsData) {
      setSessions(sessionsData);

      // Calculate total hours
      const totalMinutes = sessionsData.reduce(
        (sum, s) => sum + s.duration_minutes,
        0
      );
      setTotalHours(Math.round((totalMinutes / 60) * 10) / 10);

      // Calculate streak
      if (sessionsData.length > 0) {
        const uniqueDays = new Set<string>();
        sessionsData.forEach((s) => {
          const date = new Date(s.started_at).toDateString();
          uniqueDays.add(date);
        });

        const sortedDays = Array.from(uniqueDays).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
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
      }

      // Calculate subject stats
      const subjectMap = new Map<string, SubjectStats>();
      sessionsData.forEach((s) => {
        const subject = s.subject || "General";
        const existing = subjectMap.get(subject);
        if (existing) {
          existing.total_minutes += s.duration_minutes;
          existing.sessions += 1;
        } else {
          subjectMap.set(subject, {
            subject,
            total_minutes: s.duration_minutes,
            sessions: 1,
          });
        }
      });

      const stats = Array.from(subjectMap.values()).sort(
        (a, b) => b.total_minutes - a.total_minutes
      );
      setSubjectStats(stats);
    }

    setLoading(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const maxSubjectMinutes = Math.max(
    ...subjectStats.map((s) => s.total_minutes),
    1
  );

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

      <div className="progress-container">
        <div className="progress-header">
          <h1>Your Progress</h1>
          <p>Track your study journey</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(202,138,4,0.12)", color: "var(--accent)" }}>
              &#9201;
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalHours}</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(234,88,12,0.1)", color: "var(--orange)" }}>
              &#128293;
            </div>
            <div className="stat-info">
              <div className="stat-value">{studyStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(22,163,74,0.1)", color: "var(--green)" }}>
              &#128202;
            </div>
            <div className="stat-info">
              <div className="stat-value">{sessions.length}</div>
              <div className="stat-label">Sessions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(37,99,235,0.1)", color: "var(--blue)" }}>
              &#128218;
            </div>
            <div className="stat-info">
              <div className="stat-value">{subjectStats.length}</div>
              <div className="stat-label">Subjects</div>
            </div>
          </div>
        </div>

        {subjectStats.length > 0 && (
          <div className="section">
            <h2 className="section-title">Study Time by Subject</h2>
            <div className="subject-bars">
              {subjectStats.map((stat) => (
                <div key={stat.subject} className="subject-bar-item">
                  <div className="subject-bar-header">
                    <span className="subject-name">{stat.subject}</span>
                    <span className="subject-time">
                      {formatDuration(stat.total_minutes)} ({stat.sessions}{" "}
                      {stat.sessions === 1 ? "session" : "sessions"})
                    </span>
                  </div>
                  <div className="subject-bar-bg">
                    <div
                      className="subject-bar-fill"
                      style={{
                        width: `${(stat.total_minutes / maxSubjectMinutes) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="section">
            <h2 className="section-title">Recent Sessions</h2>
            <div className="sessions-list">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="session-item">
                  <div className="session-icon">&#128218;</div>
                  <div className="session-info">
                    <div className="session-subject">
                      {session.subject || "General"}
                    </div>
                    <div className="session-date">
                      {formatDate(session.started_at)}
                    </div>
                  </div>
                  <div className="session-duration">
                    {formatDuration(session.duration_minutes)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">&#128200;</div>
            <h3>No study sessions yet</h3>
            <p>Start using the timer to track your progress</p>
            <Link href="/timer" className="btn btn-primary">
              Start Studying
            </Link>
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
        .progress-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .progress-header {
          margin-bottom: 2rem;
        }
        .progress-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .progress-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .stat-info {
          flex: 1;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.2rem;
          background: linear-gradient(135deg, var(--text), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .section {
          margin-bottom: 3rem;
        }
        .section-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.3px;
        }
        .subject-bars {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .subject-bar-item {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
        }
        .subject-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .subject-name {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .subject-time {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .subject-bar-bg {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .subject-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), #eab308);
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .session-item {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }
        .session-item:hover {
          border-color: var(--border-hover);
        }
        .session-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .session-info {
          flex: 1;
        }
        .session-subject {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
        }
        .session-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .session-duration {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--accent);
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
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .progress-container {
            padding: 2rem 1rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .subject-bar-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }
        }
      `}</style>
    </>
  );
}
