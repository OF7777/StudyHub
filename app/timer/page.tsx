"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudyTimer from "@/components/study-timer";

export default function TimerPage() {
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

  const handleSessionComplete = () => {
    router.refresh();
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

      <div className="timer-page-container">
        <div className="timer-header">
          <h1>Study Timer</h1>
          <p>Track your study sessions and build your streak</p>
        </div>

        <StudyTimer onSessionComplete={handleSessionComplete} />

        <div className="timer-tips">
          <h3>💡 Tips</h3>
          <ul>
            <li>Study for at least 1 minute to save a session</li>
            <li>Add a subject to organize your study time</li>
            <li>Consistent daily sessions build your streak</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .nav-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .timer-page-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .timer-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .timer-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .timer-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .timer-tips {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          margin-top: 2rem;
        }
        .timer-tips h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        .timer-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .timer-tips li {
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 0.3rem 0;
          padding-left: 1.2rem;
          position: relative;
        }
        .timer-tips li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--accent);
          font-weight: 700;
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
