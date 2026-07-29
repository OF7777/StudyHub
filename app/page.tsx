import Navbar from "@/components/navbar";
import Reveal from "@/components/reveal";
import Counter from "@/components/counter";

export default function Home() {
  return (
    <>
      <div className="bg-effects">
        <div className="bg-grid"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <Navbar />

      <section className="hero">
        <Reveal>
          <div className="hero-badge">
            <span className="dot"></span> Free &amp; Open Source
          </div>
        </Reveal>
        <Reveal delay={1}>
          <h1>
            Your all-in-one
            <br />
            <span className="gradient">study companion</span>
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p>
            Organize notes, track progress, and master any subject with smart
            tools built for focused learning.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div className="hero-actions">
            <a href="#" className="btn btn-primary btn-lg">
              Start Studying
            </a>
            <a href="#features" className="btn btn-outline btn-lg">
              Learn More
            </a>
          </div>
        </Reveal>
        <Reveal delay={4}>
          <div className="hero-sub">
            No credit card required &middot; Free forever
          </div>
        </Reveal>
      </section>

      <div className="hero-preview">
        <Reveal delay={4}>
          <div className="preview-window">
            <div className="preview-bar">
              <div className="preview-dot"></div>
              <div className="preview-dot"></div>
              <div className="preview-dot"></div>
            </div>
            <div className="preview-content">
              <div className="preview-sidebar">
                <div className="preview-sidebar-item active">
                  &#128218; My Notes
                </div>
                <div className="preview-sidebar-item">&#128200; Progress</div>
                <div className="preview-sidebar-item">&#128197; Planner</div>
                <div className="preview-sidebar-item">&#127183; Flashcards</div>
                <div className="preview-sidebar-item">&#9201; Timer</div>
              </div>
              <div className="preview-main">
                <div className="preview-line"></div>
                <div className="preview-line"></div>
                <div className="preview-line"></div>
                <div className="preview-line"></div>
                <div className="preview-cards-row">
                  <div className="preview-mini-card">
                    <div className="bar" style={{ width: "60%" }}></div>
                    <div className="bar-fill"></div>
                  </div>
                  <div className="preview-mini-card">
                    <div className="bar" style={{ width: "45%" }}></div>
                    <div className="bar-fill"></div>
                  </div>
                  <div className="preview-mini-card">
                    <div className="bar" style={{ width: "70%" }}></div>
                    <div className="bar-fill"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="preview-glow"></div>
        </Reveal>
      </div>

      <div className="stats-wrap">
        <Reveal>
          <div className="stats">
            <div className="stat">
              <Counter target={12450} suffix="+" />
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat">
              <Counter target={89000} suffix="+" />
              <div className="stat-label">Study Hours</div>
            </div>
            <div className="stat">
              <Counter target={45} suffix="+" />
              <div className="stat-label">Subjects</div>
            </div>
          </div>
        </Reveal>
      </div>

      <section className="section" id="features">
        <Reveal>
          <div className="section-label">Features</div>
        </Reveal>
        <Reveal>
          <h2 className="section-title">
            Everything you need to study smarter
          </h2>
        </Reveal>
        <Reveal>
          <p className="section-sub">
            Powerful tools designed to help you learn efficiently and retain
            more.
          </p>
        </Reveal>
        <div className="features-grid">
          <Reveal>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "rgba(202,138,4,0.12)",
                  color: "var(--accent)",
                }}
              >
                &#128221;
              </div>
              <h3>Smart Notes</h3>
              <p>
                Rich-text editor with markdown support, code blocks, and LaTeX
                for math notation.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  color: "var(--green)",
                }}
              >
                &#128200;
              </div>
              <h3>Progress Tracking</h3>
              <p>
                Visualize your study streaks, hours logged, and subject mastery
                over time.
              </p>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "rgba(234,88,12,0.1)",
                  color: "var(--orange)",
                }}
              >
                &#128197;
              </div>
              <h3>Study Planner</h3>
              <p>
                Schedule sessions, set goals, and get reminders to stay on track
                with exams.
              </p>
            </div>
          </Reveal>
          <Reveal delay={3}>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "rgba(219,39,119,0.1)",
                  color: "var(--pink)",
                }}
              >
                &#127183;
              </div>
              <h3>Flashcards</h3>
              <p>
                Spaced repetition system that adapts to your memory for optimal
                retention.
              </p>
            </div>
          </Reveal>
          <Reveal delay={4}>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "rgba(37,99,235,0.1)",
                  color: "var(--blue)",
                }}
              >
                &#9201;
              </div>
              <h3>Pomodoro Timer</h3>
              <p>
                Built-in focus timer with customizable work and break intervals.
              </p>
            </div>
          </Reveal>
          <Reveal delay={5}>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "rgba(8,145,178,0.1)",
                  color: "var(--cyan)",
                }}
              >
                &#128101;
              </div>
              <h3>Study Groups</h3>
              <p>
                Collaborate with classmates, share notes, and quiz each other in
                real time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <Reveal>
          <div className="section-label">How It Works</div>
        </Reveal>
        <Reveal>
          <h2 className="section-title">Up and running in minutes</h2>
        </Reveal>
        <Reveal>
          <p className="section-sub">
            Three simple steps to transform the way you study.
          </p>
        </Reveal>
        <div className="steps">
          <Reveal>
            <div className="step">
              <div className="step-num">1</div>
              <h3>Create your account</h3>
              <p>
                Sign up for free in seconds. No credit card needed, no strings
                attached.
              </p>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Set up your subjects</h3>
              <p>
                Choose from 45+ subjects or create custom ones. Import notes or
                start fresh.
              </p>
            </div>
          </Reveal>
          <Reveal delay={4}>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Start studying</h3>
              <p>
                Use smart tools to learn faster, track your progress, and ace
                your exams.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" id="subjects">
        <Reveal>
          <div className="section-label">Subjects</div>
        </Reveal>
        <Reveal>
          <h2 className="section-title">Explore subjects</h2>
        </Reveal>
        <Reveal>
          <p className="section-sub">
            Pre-built templates and resources for popular subjects.
          </p>
        </Reveal>
        <div className="subjects-grid">
          <Reveal>
            <div className="subject-card">
              <div className="subject-icon">&#128290;</div>
              <h4>Mathematics</h4>
              <span>142 resources</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="subject-card">
              <div className="subject-icon">&#9883;</div>
              <h4>Physics</h4>
              <span>98 resources</span>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="subject-card">
              <div className="subject-icon">&#129516;</div>
              <h4>Chemistry</h4>
              <span>76 resources</span>
            </div>
          </Reveal>
          <Reveal delay={3}>
            <div className="subject-card">
              <div className="subject-icon">&#129668;</div>
              <h4>Biology</h4>
              <span>110 resources</span>
            </div>
          </Reveal>
          <Reveal delay={4}>
            <div className="subject-card">
              <div className="subject-icon">&#128187;</div>
              <h4>Computer Science</h4>
              <span>203 resources</span>
            </div>
          </Reveal>
          <Reveal delay={5}>
            <div className="subject-card">
              <div className="subject-icon">&#128214;</div>
              <h4>Literature</h4>
              <span>87 resources</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" id="testimonials">
        <Reveal>
          <div className="section-label">Testimonials</div>
        </Reveal>
        <Reveal>
          <h2 className="section-title">Loved by students everywhere</h2>
        </Reveal>
        <Reveal>
          <p className="section-sub">
            See what our community has to say about StudyHub.
          </p>
        </Reveal>
        <div className="testimonials-grid">
          <Reveal>
            <div className="testimonial">
              <div className="testimonial-stars">
                &#9733;&#9733;&#9733;&#9733;&#9733;
              </div>
              <p>
                &ldquo;StudyHub completely changed how I prepare for exams. The
                flashcard system alone helped me raise my GPA by a full
                point.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AK</div>
                <div>
                  <div className="testimonial-name">Alex Kim</div>
                  <div className="testimonial-role">CS Major, Stanford</div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="testimonial">
              <div className="testimonial-stars">
                &#9733;&#9733;&#9733;&#9733;&#9733;
              </div>
              <p>
                &ldquo;The Pomodoro timer and study planner keep me accountable.
                I&rsquo;ve never been this consistent with my study habits
                before.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ color: "var(--pink)" }}>
                  SR
                </div>
                <div>
                  <div className="testimonial-name">Sarah Rodriguez</div>
                  <div className="testimonial-role">Pre-Med, UCLA</div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="testimonial">
              <div className="testimonial-stars">
                &#9733;&#9733;&#9733;&#9733;&#9733;
              </div>
              <p>
                &ldquo;I love the study groups feature. My friends and I share
                notes and quiz each other before every exam. Absolute game
                changer.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ color: "var(--green)" }}>
                  JT
                </div>
                <div>
                  <div className="testimonial-name">James Taylor</div>
                  <div className="testimonial-role">Engineering, MIT</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="cta-wrap">
        <Reveal>
          <div className="cta">
            <div className="cta-glow"></div>
            <h2>Ready to level up your studying?</h2>
            <p>
              Join thousands of students already using StudyHub to ace their
              exams.
            </p>
            <a href="#" className="btn btn-primary btn-lg">
              Create Free Account
            </a>
          </div>
        </Reveal>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">S</div>
              Study<span>Hub</span>
            </div>
            <p>
              The all-in-one study platform built for students who want to learn
              smarter, not harder.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h5>Product</h5>
              <a href="#">Features</a>
              <a href="#">Subjects</a>
              <a href="#">Pricing</a>
              <a href="#">Changelog</a>
            </div>
            <div className="footer-col">
              <h5>Resources</h5>
              <a href="#">Documentation</a>
              <a href="#">Blog</a>
              <a href="#">Community</a>
              <a href="#">Support</a>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 StudyHub. All rights reserved.</span>
          <span>Made with care for students everywhere.</span>
        </div>
      </footer>
    </>
  );
}
