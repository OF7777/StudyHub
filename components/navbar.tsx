"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav>
      <div className="logo">
        <div className="logo-icon">S</div>
        Study<span>Hub</span>
      </div>
      <div className={`nav-links${open ? " open" : ""}`}>
        <Link href="#features" onClick={closeMenu}>Features</Link>
        <Link href="#how-it-works" onClick={closeMenu}>How It Works</Link>
        <Link href="#subjects" onClick={closeMenu}>Subjects</Link>
        <Link href="#testimonials" onClick={closeMenu}>Reviews</Link>
        <a href="#" className="btn btn-primary" style={{ marginLeft: "0.5rem" }}>
          Get Started
        </a>
      </div>
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
