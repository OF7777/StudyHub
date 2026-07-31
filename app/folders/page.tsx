"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Folder = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#ca8a04");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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
      .order("created_at", { ascending: false });

    if (data) setFolders(data);
    setLoading(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("folders")
      .insert({
        user_id: user.id,
        name: newFolderName.trim(),
        color: newFolderColor,
      })
      .select()
      .single();

    if (data && !error) {
      setFolders([data, ...folders]);
      setNewFolderName("");
      setNewFolderColor("#ca8a04");
    }
    setCreating(false);
  };

  const deleteFolder = async (id: string) => {
    if (!confirm("Delete this folder? Notes in it will become unorganized.")) return;

    const { error } = await supabase.from("folders").delete().eq("id", id);
    if (!error) {
      setFolders(folders.filter((f) => f.id !== id));
    }
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

      <div className="folders-container">
        <div className="folders-header">
          <h1>Manage Folders</h1>
          <p>Organize your notes into folders</p>
        </div>

        <div className="create-folder-card">
          <h3>Create New Folder</h3>
          <div className="create-form">
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="folder-input"
            />
            <div className="color-picker">
              {["#ca8a04", "#16a34a", "#2563eb", "#db2777", "#ea580c", "#7c3aed"].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewFolderColor(color)}
                  className={`color-swatch ${newFolderColor === color ? "active" : ""}`}
                  style={{ background: color }}
                />
              ))}
            </div>
            <button
              onClick={createFolder}
              disabled={creating || !newFolderName.trim()}
              className="btn btn-primary"
            >
              {creating ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </div>

        {folders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No folders yet</h3>
            <p>Create your first folder to start organizing</p>
          </div>
        ) : (
          <div className="folders-grid">
            {folders.map((folder) => (
              <div key={folder.id} className="folder-card">
                <div className="folder-color" style={{ background: folder.color }}></div>
                <div className="folder-info">
                  <h3>{folder.name}</h3>
                  <span className="folder-date">
                    Created {new Date(folder.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
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
        .folders-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .folders-header {
          margin-bottom: 2rem;
        }
        .folders-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.3rem;
        }
        .folders-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .create-folder-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .create-folder-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .create-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .folder-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.7);
        }
        .folder-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }
        .color-picker {
          display: flex;
          gap: 0.5rem;
        }
        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .color-swatch:hover {
          transform: scale(1.1);
        }
        .color-swatch.active {
          border-color: var(--text);
          box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text);
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
        }
        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .folder-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s;
        }
        .folder-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        .folder-color {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .folder-info {
          flex: 1;
        }
        .folder-info h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .folder-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .delete-btn {
          background: rgba(234, 88, 12, 0.1);
          color: var(--orange);
          border: 1px solid rgba(234, 88, 12, 0.2);
          border-radius: 8px;
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .delete-btn:hover {
          background: rgba(234, 88, 12, 0.15);
        }
        @media (max-width: 768px) {
          .nav-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          .folders-container {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </>
  );
}
