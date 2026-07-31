"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkAndAwardBadges } from "@/lib/badge-awards";

type Folder = {
  id: string;
  name: string;
  color: string;
};

export default function NewNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      fetchFolders();
    };
    checkAuth();
  }, [router, supabase]);

  const fetchFolders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) setFolders(data);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title");
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

    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      subject: subject.trim() || null,
      folder_id: folderId || null,
    });

    if (error) {
      setError("Failed to save note");
      setSaving(false);
    } else {
      await checkAndAwardBadges(user.id);
      router.push("/notes");
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
        <Link href="/notes" className="logo">
          <div className="logo-icon">S</div>
          Study<span>Hub</span>
        </Link>
        <div className="nav-actions">
          <Link href="/notes" className="btn btn-outline">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </nav>

      <div className="editor-container">
        <div className="editor-card">
          {error && <div className="error-message">{error}</div>}

          <div className="meta-row">
            <input
              type="text"
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="subject-input"
            />

            {folders.length > 0 && (
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="folder-select"
              >
                <option value="">No Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
            autoFocus
          />

          <textarea
            placeholder="Start writing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-input"
          />
        </div>
      </div>

      <style jsx>{`
        .nav-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .editor-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .editor-card {
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
        .meta-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .subject-input {
          flex: 1;
          min-width: 150px;
          border: none;
          outline: none;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: inherit;
          background: transparent;
          color: var(--accent);
        }
        .subject-input::placeholder {
          color: var(--text-dim);
        }
        .folder-select {
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          min-width: 140px;
        }
        .folder-select:focus {
          outline: none;
          border-color: var(--accent);
        }
        .title-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 1.8rem;
          font-weight: 800;
          font-family: inherit;
          letter-spacing: -0.5px;
          background: transparent;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        .title-input::placeholder {
          color: var(--text-dim);
        }
        .content-input {
          width: 100%;
          min-height: 400px;
          border: none;
          outline: none;
          font-size: 1rem;
          font-family: inherit;
          line-height: 1.7;
          background: transparent;
          resize: vertical;
          color: var(--text);
        }
        .content-input::placeholder {
          color: var(--text-dim);
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .editor-container {
            padding: 1rem;
          }
          .editor-card {
            padding: 1.5rem;
          }
          .title-input {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  );
}
