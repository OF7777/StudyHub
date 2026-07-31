"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";

export default function StudyTimer({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [subject, setSubject] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - seconds * 1000;
      intervalRef.current = setInterval(() => {
        setSeconds(Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = async () => {
    setIsRunning(false);
    
    if (seconds >= 60) {
      const minutes = Math.round(seconds / 60);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("study_sessions").insert({
          user_id: user.id,
          subject: subject || null,
          duration_minutes: minutes,
          started_at: new Date(Date.now() - seconds * 1000).toISOString(),
          ended_at: new Date().toISOString(),
        });
        
        if (onSessionComplete) {
          onSessionComplete();
        }
      }
    }
    
    setSeconds(0);
    setSubject("");
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setSubject("");
  };

  return (
    <div className="timer-container">
      <div className="timer-display">{formatTime(seconds)}</div>
      
      {!isRunning && seconds === 0 && (
        <>
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="timer-input"
          />
          <button onClick={handleStart} className="btn btn-primary timer-btn">
            Start Timer
          </button>
        </>
      )}
      
      {isRunning && (
        <button onClick={handleStop} className="btn btn-outline timer-btn">
          Stop & Save
        </button>
      )}
      
      {!isRunning && seconds > 0 && (
        <button onClick={handleReset} className="btn btn-outline timer-btn">
          Reset
        </button>
      )}

      <style jsx>{`
        .timer-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          margin: 2rem auto;
          max-width: 400px;
        }
        .timer-display {
          font-size: 3rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          background: linear-gradient(135deg, var(--text), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }
        .timer-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.5);
          text-align: center;
        }
        .timer-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }
        .timer-btn {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
