import Reveal from "@/components/reveal";

export default function Home() {
  return (
    <>
      <div className="bg-effects">
        <div className="bg-grid"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

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
              Sign In
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
