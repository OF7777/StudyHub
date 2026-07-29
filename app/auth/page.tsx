"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Reveal from "@/components/reveal";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Account created! Redirecting..." });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Logged in successfully! Redirecting..." });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    }

    setLoading(false);
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
        <Link href="/" className="logo">
          <div className="logo-icon">S</div>
          Study<span>Hub</span>
        </Link>
      </nav>

      <div className="auth-container">
        <Reveal>
          <div className="auth-card">
            <div className="auth-header">
              <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
              <p>{isSignUp ? "Start your study journey today" : "Sign in to continue studying"}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {message && (
                <div className={`auth-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <div className="auth-toggle">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: calc(100vh - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .auth-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-header h1 {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 0.4rem;
          letter-spacing: -0.5px;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text);
        }
        .form-group input {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }
        .auth-message {
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.85rem;
          text-align: center;
        }
        .auth-message.success {
          background: rgba(22, 163, 74, 0.1);
          color: var(--green);
          border: 1px solid rgba(22, 163, 74, 0.2);
        }
        .auth-message.error {
          background: rgba(234, 88, 12, 0.1);
          color: var(--orange);
          border: 1px solid rgba(234, 88, 12, 0.2);
        }
        .auth-btn {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .auth-toggle {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .auth-toggle button {
          background: none;
          border: none;
          color: var(--accent);
          font-weight: 600;
          cursor: pointer;
          margin-left: 0.3rem;
          font-family: inherit;
          font-size: inherit;
        }
        .auth-toggle button:hover {
          color: var(--accent-hover);
        }
      `}</style>
    </>
  );
}
