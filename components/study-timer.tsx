"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { checkAndAwardBadges } from "@/lib/badge-awards";

type Timer = {
  id: string;
  subject: string;
  targetSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startTime: number | null;
};

export default function StudyTimer({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [subject, setSubject] = useState("");
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>("default");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setNotificationStatus(Notification.permission);
    const saved = localStorage.getItem("studyhub-timer-notifications");
    if (saved !== null) {
      setNotificationsEnabled(saved === "true");
    }
  }, []);

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem("studyhub-timer-notifications", String(newVal));
  };

  useEffect(() => {
    setNotificationStatus(Notification.permission);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (!timer.isRunning || !timer.startTime) return timer;
          
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
          const remaining = timer.targetSeconds - elapsed;
          
          if (remaining <= 0) {
            handleTimerComplete(timer);
            return { ...timer, isRunning: false, remainingSeconds: 0 };
          }
          
          return { ...timer, remainingSeconds: remaining };
        })
      );
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddTimer = () => {
    const totalSeconds = inputHours * 3600 + inputMinutes * 60 + inputSeconds;
    if (totalSeconds > 0) {
      const newTimer: Timer = {
        id: Date.now().toString(),
        subject: subject || "Study Session",
        targetSeconds: totalSeconds,
        remainingSeconds: totalSeconds,
        isRunning: true,
        startTime: Date.now(),
      };
      setTimers([...timers, newTimer]);
      setSubject("");
      setInputHours(0);
      setInputMinutes(25);
      setInputSeconds(0);
    }
  };

  const handleStartTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, isRunning: true, startTime: Date.now() }
          : timer
      )
    );
  };

  const handleStopTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, isRunning: false, startTime: null }
          : timer
      )
    );
  };

  const handleTimerComplete = async (timer: Timer) => {
    // Show flash screen
    setCompletedTimer(timer);
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification only if enabled
    if (notificationsEnabled && Notification.permission === "granted") {
      new Notification("Study Time's Up! 🎉", {
        body: `Great job studying ${timer.subject}! Time to take a break.`,
        icon: "/favicon.ico",
      });
    }
    
    // Save session
    const minutes = Math.round(timer.targetSeconds / 60);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && minutes >= 1) {
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject: timer.subject,
        duration_minutes: minutes,
        started_at: new Date(Date.now() - timer.targetSeconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
      
      await checkAndAwardBadges(user.id);
      
      if (onSessionComplete) {
        onSessionComplete();
      }
    }
  };

  const handleDismissFlash = () => {
    setCompletedTimer(null);
    // Remove completed timer from list
    setTimers((prev) => prev.filter((t) => t.id !== completedTimer?.id));
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  return (
    <>
      <div className="timer-container">
        <div className="timer-setup">
          <div className="timer-duration-input">
            <div className="time-input-group">
              <label>Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={inputHours}
                onChange={(e) => setInputHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                className="time-input"
              />
            </div>
            <div className="time-input-group">
              <label>Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="time-input"
              />
            </div>
            <div className="time-input-group">
              <label>Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="time-input"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="timer-input"
          />
          <button onClick={handleAddTimer} className="btn btn-primary timer-btn">
            + Add Timer
          </button>
          <div className="notification-status">
            {notificationStatus === "denied" ? (
              <span className="notification-badge notification-denied">
                🔕 Notifications Blocked (enable in browser settings)
              </span>
            ) : notificationStatus === "default" ? (
              <button onClick={requestNotificationPermission} className="btn btn-outline timer-btn" style={{ fontSize: "0.85rem" }}>
                🔔 Enable Notifications
              </button>
            ) : (
              <button onClick={toggleNotifications} className={`notification-badge ${notificationsEnabled ? "notification-enabled" : "notification-disabled"}`}>
                {notificationsEnabled ? "🔔 Notifications On" : "🔕 Notifications Off"}
                <span style={{ fontSize: "0.75rem", opacity: 0.7, marginLeft: "0.5rem" }}>
                  (click to {notificationsEnabled ? "disable" : "enable"})
                </span>
              </button>
            )}
          </div>
        </div>

        {timers.length > 0 && (
          <div className="timers-list">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Active Timers ({timers.length})</h3>
            {timers.map((timer) => (
              <div key={timer.id} className="timer-card">
                <div className="timer-card-header">
                  <h4>{timer.subject}</h4>
                  <button
                    onClick={() => handleDeleteTimer(timer.id)}
                    className="delete-timer-btn"
                    title="Delete timer"
                  >
                    ✕
                  </button>
                </div>
                <div className="timer-card-display">
                  {formatTime(timer.remainingSeconds)}
                </div>
                <div className="timer-card-controls">
                  {!timer.isRunning && timer.remainingSeconds === timer.targetSeconds && (
                    <button onClick={() => handleStartTimer(timer.id)} className="btn btn-primary timer-btn">
                      Start
                    </button>
                  )}
                  {timer.isRunning && (
                    <button onClick={() => handleStopTimer(timer.id)} className="btn btn-outline timer-btn">
                      Stop
                    </button>
                  )}
                  {!timer.isRunning && timer.remainingSeconds < timer.targetSeconds && timer.remainingSeconds > 0 && (
                    <button onClick={() => handleStartTimer(timer.id)} className="btn btn-primary timer-btn">
                      Resume
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedTimer && (
        <div className="flash-overlay" onClick={handleDismissFlash}>
          <div className="flash-content">
            <div className="flash-icon">🎉</div>
            <h1 className="flash-title">Time's Up!</h1>
            <h2 className="flash-subject">{completedTimer.subject}</h2>
            <p className="flash-message">Great job! Click anywhere to dismiss</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .timer-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          margin: 2rem auto;
          max-width: 500px;
        }
        .timer-setup {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .timer-duration-input {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
        }
        .time-input-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .time-input-group label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .time-input {
          width: 70px;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 1.1rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.5);
          text-align: center;
          font-weight: 700;
        }
        .time-input::-webkit-inner-spin-button,
        .time-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .time-input[type=number] {
          -moz-appearance: textfield;
        }
        .time-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
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
        .timers-list {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }
        .timer-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: all 0.2s;
        }
        .timer-card:hover {
          border-color: var(--border-hover);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .timer-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .timer-card-header h4 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
        }
        .delete-timer-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .delete-timer-btn:hover {
          background: rgba(234, 88, 12, 0.1);
          color: var(--orange);
        }
        .timer-card-display {
          font-size: 2.5rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          text-align: center;
          margin: 1rem 0;
          background: linear-gradient(135deg, var(--text), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .timer-card-controls {
          display: flex;
          gap: 0.5rem;
        }
        .flash-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, var(--accent), var(--orange));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: pointer;
          animation: flashPulse 0.5s ease-in-out infinite alternate;
        }
        @keyframes flashPulse {
          from {
            opacity: 1;
          }
          to {
            opacity: 0.85;
          }
        }
        .flash-content {
          text-align: center;
          color: white;
          animation: flashBounce 0.6s ease-out;
        }
        @keyframes flashBounce {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .flash-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }
        .flash-title {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .flash-subject {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: inline-block;
        }
        .flash-message {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        .notification-status {
          display: flex;
          justify-content: center;
        }
        .notification-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .notification-enabled {
          background: rgba(22, 163, 74, 0.1);
          color: var(--green);
          border: 1px solid rgba(22, 163, 74, 0.2);
        }
        .notification-denied {
          background: rgba(234, 88, 12, 0.1);
          color: var(--orange);
          border: 1px solid rgba(234, 88, 12, 0.2);
        }
        .notification-disabled {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-muted);
          border: 1px solid var(--border);
          cursor: pointer;
        }
        .notification-enabled {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
