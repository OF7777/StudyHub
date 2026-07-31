"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/reveal";

type StudySession = {
  id: string;
  user_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  subject: string | null;
  notes: string | null;
  created_at: string;
};

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    subject: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        fetchSessions();
      }
      setLoading(false);
    };
    getUser();
  }, [router, supabase]);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user found");
      return;
    }

    console.log("Fetching for user:", user.id);
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Test if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("study_sessions")
      .select("id")
      .limit(1);
    
    console.log("Table check:", { tableCheck, tableError });

    if (tableError) {
      console.error("Table doesn't exist or not accessible:", tableError);
      return;
    }

    try {
      const { data, error, status, statusText } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      console.log("Raw response:", { data, error, status, statusText });

      if (error) {
        console.error("Fetch error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return;
      }

      if (data) {
        setSessions(data);
        console.log("Loaded sessions:", data.length);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setFormData({ ...formData, date });
  };

  const handleAddEvent = () => {
    setEditingSession(null);
    setFormData({ ...formData, date: selectedDate || "" });
    setShowModal(true);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSelectedDate(session.date);
    setFormData({
      date: session.date,
      start_time: session.start_time || "",
      end_time: session.end_time || "",
      subject: session.subject || "",
      notes: session.notes || "",
    });
    setShowModal(true);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this study session?")) return;
    await supabase.from("study_sessions").delete().eq("id", id);
    fetchSessions();
  };

  const handleSave = async () => {
    if (!formData.date) return;
    setSaving(true);

    const sessionData = {
      date: formData.date,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      subject: formData.subject || null,
      notes: formData.notes || null,
      user_id: user.id,
    };

    console.log("Saving session:", sessionData);

    if (editingSession) {
      const { error } = await supabase.from("study_sessions").update(sessionData).eq("id", editingSession.id);
      if (error) {
        console.error("Update error:", error);
        alert(`Failed to update: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from("study_sessions").insert([sessionData]);
      if (error) {
        console.error("Insert error:", error);
        alert(`Failed to save: ${error.message}`);
      }
    }

    setSaving(false);
    setShowModal(false);
    setEditingSession(null);
    setFormData({ date: "", start_time: "", end_time: "", subject: "", notes: "" });
    fetchSessions();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const today = formatDate(new Date());

  const sessionsByDate = sessions.reduce((acc, session) => {
    if (!acc[session.date]) acc[session.date] = [];
    acc[session.date].push(session);
    return acc;
  }, {} as Record<string, StudySession[]>);

  return (
    <>
      <div style={{ padding: "1rem 2rem" }}>
        <Link href="/dashboard" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="section">
        <Reveal>
          <p className="section-label">Calendar</p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">Study Schedule</h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="section-sub">
            Plan your study sessions and track your progress.
          </p>
        </Reveal>

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <button onClick={handlePrevMonth} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>
              ←
            </button>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{monthName}</h3>
            <button onClick={handleNextMonth} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>
              →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} style={{ textAlign: "center", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-muted)", padding: "0.5rem" }}>
                {day}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              const daySessions = sessionsByDate[dateStr] || [];
              const isToday = dateStr === today;

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(dateStr)}
                  style={{
                    padding: "0.75rem",
                    minHeight: "80px",
                    border: isToday ? "2px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: isToday ? "rgba(202,138,4,0.05)" : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isToday ? "rgba(202,138,4,0.05)" : "rgba(255,255,255,0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{day}</div>
                  {daySessions.slice(0, 2).map((session) => (
                    <div
                      key={session.id}
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.4rem",
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: "4px",
                        marginBottom: "0.2rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {session.subject || "Study"}
                    </div>
                  ))}
                  {daySessions.length > 2 && (
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      +{daySessions.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedDate(null)}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: 600, width: "90%", maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                    {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h3>
                  <button onClick={() => setSelectedDate(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}>×</button>
                </div>
                
                {sessionsByDate[selectedDate]?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {sessionsByDate[selectedDate].map((session) => (
                      <div key={session.id} style={{ padding: "1rem", background: "rgba(255,255,255,0.8)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                          <div style={{ flex: 1 }}>
                            {session.subject && <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{session.subject}</div>}
                            {(session.start_time || session.end_time) && (
                              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                {session.start_time && session.start_time.slice(0, 5)}
                                {session.end_time && ` - ${session.end_time.slice(0, 5)}`}
                              </div>
                            )}
                            {session.notes && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{session.notes}</div>}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                            <button onClick={() => handleEditSession(session)} className="btn btn-outline" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                              Edit
                            </button>
                            <button onClick={() => handleDeleteSession(session.id)} className="btn btn-outline" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem", color: "var(--orange)" }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center", padding: "2rem" }}>No events scheduled for this day.</p>
                )}
                
                <button onClick={handleAddEvent} className="btn btn-primary" style={{ width: "100%" }}>
                  + Add Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: 500, width: "90%", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {editingSession ? "Edit Session" : "New Study Session"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Math, Physics, History"
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.9rem", fontFamily: "inherit" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.9rem", fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.9rem", fontFamily: "inherit" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What will you study?"
                  rows={3}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                  {saving ? "Saving..." : editingSession ? "Update" : "Create"}
                </button>
                <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
