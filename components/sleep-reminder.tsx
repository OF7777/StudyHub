"use client";

import { useEffect, useState } from "react";

export default function SleepReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 0) {
        setShow(true);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem",
        maxWidth: 400,
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌙</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Time to get some sleep!
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          It&apos;s 11 PM. Rest is important for learning — your brain consolidates memories while you sleep.
        </p>
        <button
          onClick={() => setShow(false)}
          className="btn btn-primary"
          style={{ padding: "0.7rem 1.5rem" }}
        >
          I&apos;ll wrap up soon
        </button>
      </div>
    </div>
  );
}
