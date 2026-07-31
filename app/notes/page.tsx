"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/reveal";

type Note = {
  id: string;
  title: string;
  content: string;
  subject: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  folders?: {
    name: string;
    color: string;
  } | null;
};

type Folder = {
  id: string;
  name: string;
  color: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      await fetchNotes();
      await fetchFolders();
    };

    checkAuth();
  }, [router, supabase]);

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*, folders(name, color)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setDeletingId(id);
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (!error) {
      setNotes(notes.filter((n) => n.id !== id));
    }
    setDeletingId(null);
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder =
        selectedFolder === "all" || note.folder_id === selectedFolder;
      const matchesSubject =
        selectedSubject === "all" || note.subject === selectedSubject;
      return matchesSearch && matchesFolder && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Get unique subjects
  const uniqueSubjects = Array.from(
    new Set(notes.map((n) => n.subject).filter((s): s is string => s !== null))
  ).sort();

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
          <Link href="/folders" className="btn btn-ghost">
            Manage Folders
          </Link>
          <Link href="/notes/new" className="btn btn-primary">
            + New Note
          </Link>
        </div>
      </nav>

      <div className="notes-container">
        <div className="notes-header">
          <h1>My Notes</h1>
          <p>{filteredNotes.length} of {notes.length} {notes.length === 1 ? "note" : "notes"}</p>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            {notes.length === 0 ? (
              <>
                <div className="empty-icon">&#128221;</div>
                <h3>No notes yet</h3>
                <p>Create your first note to get started</p>
                <Link href="/notes/new" className="btn btn-primary">
                  Create Note
                </Link>
              </>
            ) : (
              <>
                <div className="empty-icon">&#128269;</div>
                <h3>No notes found</h3>
                <p>Try adjusting your filters or search query</p>
              </>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note, index) => (
              <Reveal key={note.id} delay={index % 5}>
                <div className="note-card">
                  <Link href={`/notes/${note.id}`} className="note-link">
                    <div className="note-meta-row">
                      {note.folders && (
                        <span
                          className="folder-badge"
                          style={{ background: `${note.folders.color}20`, color: note.folders.color, borderColor: `${note.folders.color}40` }}
                        >
                          {note.folders.name}
                        </span>
                      )}
                      {note.subject && (
                        <span className="subject-badge">{note.subject}</span>
                      )}
                    </div>
                    <h3>{note.title}</h3>
                    <p>{note.content.slice(0, 120) || "No content"}</p>
                    <span className="note-date">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                  >
                    {deletingId === note.id ? "..." : "Delete"}
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
        .notes-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .notes-header {
          margin-bottom: 1.5rem;
        }
        .notes-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .notes-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .filters-bar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .search-box {
          flex: 1;
          min-width: 200px;
        }
        .search-input {
          width: 100%;
          padding: 0.6rem 1rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.7);
        }
        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }
        .filter-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-select {
          padding: 0.6rem 1rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          min-width: 140px;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--accent);
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
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .note-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }
        .note-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
          border-color: var(--border-hover);
        }
        .note-link {
          flex: 1;
          display: block;
          margin-bottom: 1rem;
        }
        .note-meta-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .folder-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          border: 1px solid;
        }
        .subject-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          background: rgba(202, 138, 4, 0.1);
          color: var(--accent);
          border: 1px solid rgba(202, 138, 4, 0.2);
        }
        .note-link h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.2px;
          color: var(--text);
        }
        .note-link p {
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .note-date {
          font-size: 0.75rem;
          color: var(--text-dim);
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
          .filters-bar {
            flex-direction: column;
          }
          .filter-group {
            width: 100%;
          }
          .filter-select {
            flex: 1;
          }
        }
      `}</style>
    </>
  );
}
