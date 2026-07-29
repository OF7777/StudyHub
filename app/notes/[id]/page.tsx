"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ViewNotePage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    const fetchNote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        router.push("/notes");
        return;
      }

      setNote(data);
      setLoading(false);
    };

    fetchNote();
  }, [params.id, router, supabase]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <>
      <div className="bg-effects">
        <div className="bg-grid"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <nav>
        <Link href="/notes" className="logo">
          <div className="logo-icon">S</div>
          Study<span>Hub</span>
        </Link>
        <div className="nav-actions">
          <Link href="/notes" className="btn btn-outline">
            Back to Notes
          </Link>
        </div>
      </nav>

      <div className="note-container">
        <article className="note-card">
          <header className="note-header">
            <h1>{note.title}</h1>
            <div className="note-meta">
              <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
              <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
          </header>
          <div className="note-content">
            {note.content || <span className="empty-content">No content</span>}
          </div>
        </article>
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
        .note-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .note-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
        .note-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .note-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        .note-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .note-content {
          font-size: 1rem;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: var(--text);
        }
        .empty-content {
          color: var(--text-dim);
          font-style: italic;
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .note-container {
            padding: 1rem;
          }
          .note-card {
            padding: 1.5rem;
          }
          .note-header h1 {
            font-size: 1.5rem;
          }
          .note-meta {
            flex-direction: column;
            gap: 0.3rem;
          }
        }
      `}</style>
    </>
  );
}
