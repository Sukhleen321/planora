import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  const navigate = useNavigate();

  // Stats count state
  const [stats, setStats] = useState({ engines: 0, places: 0, guesswork: 0 });
  const statsSectionRef = useRef(null);
  const statsAnimatedRef = useRef(false);

  // Cards reveal ref
  const stepCardRefs = useRef([]);

  // Set document title
  useEffect(() => {
    document.title = "Planora — Intelligent Travel Planning";
  }, []);

  // Stats count-up animation logic
  const animateStats = (targetEngines, targetPlaces, targetGuesswork) => {
    const duration = 1800; // 1.8 seconds animation
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Quadratic ease out
      const easeProgress = progress * (2 - progress);

      setStats({
        engines: Math.floor(easeProgress * targetEngines),
        places: Math.floor(easeProgress * targetPlaces),
        guesswork: Math.floor(easeProgress * targetGuesswork),
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // IntersectionObserver for Stats count-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !statsAnimatedRef.current) {
          statsAnimatedRef.current = true;
          animateStats(7, 20000, 100);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = statsSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // IntersectionObserver for Step Cards scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target); // Unobserve once revealed
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const currentCards = stepCardRefs.current;
    currentCards.forEach((card) => {
      if (card) {
        observer.observe(card);
      }
    });

    return () => {
      currentCards.forEach((card) => {
        if (card) {
          observer.unobserve(card);
        }
      });
    };
  }, []);

  // Smooth scroll helper
  const handleScrollToHowItWorks = (e) => {
    e.preventDefault();
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ paddingTop: '76px' }}>
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content container">
          <div className="badge">
            <span>✨ AI-Powered Travel Planning</span>
          </div>
          <h1 className="hero-title">
            Plan Smarter.<br />
            <span className="text-accent">Travel Better.</span>
          </h1>
          <p className="hero-subtitle">
            Planora generates customized daily itineraries, optimizes routes, and breaks down travel budgets in seconds. Stop guessing, start exploring.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/signup')} className="btn btn-primary">
              Start Planning for Free
            </button>
            <a href="#how-it-works" onClick={handleScrollToHowItWorks} className="btn btn-secondary">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* 3. Stats Section */}
      <section className="stats-section" ref={statsSectionRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.engines}</span>
              <span className="stat-label">Intelligent Engines</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {stats.places.toLocaleString()}+
              </span>
              <span className="stat-label">Places Indexed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.guesswork}%</span>
              <span className="stat-label">Zero Guesswork</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Four advanced engines working in harmony to craft the ultimate customizable itinerary for your trip.</p>
          </div>
          
          <div className="steps-grid">
            <div 
              className="card step-card" 
              ref={(el) => (stepCardRefs.current[0] = el)}
            >
              <div className="step-icon">🎯</div>
              <h3 className="step-title">1. Profile Trip</h3>
              <p className="step-desc">
                Provide your destination, budget tier, preferred travel pace, and interests. Our platform starts crafting recommendations tailored just for you.
              </p>
            </div>

            <div 
              className="card step-card" 
              ref={(el) => (stepCardRefs.current[1] = el)}
            >
              <div className="step-icon">⚙️</div>
              <h3 className="step-title">2. Score Places</h3>
              <p className="step-desc">
                We pull matching local sites from our database, applying real-time cost-filters and user compatibility scores to find your best matches.
              </p>
            </div>

            <div 
              className="card step-card" 
              ref={(el) => (stepCardRefs.current[2] = el)}
            >
              <div className="step-icon">📋</div>
              <h3 className="step-title">3. Get Itinerary</h3>
              <p className="step-desc">
                Places are automatically scheduled into optimized morning, afternoon, evening, and night slots to ensure you make the most of every day.
              </p>
            </div>

            <div 
              className="card step-card" 
              ref={(el) => (stepCardRefs.current[3] = el)}
            >
              <div className="step-icon">✏️</div>
              <h3 className="step-title">4. Refine & Edit</h3>
              <p className="step-desc">
                Not fully satisfied? Swap destinations, insert custom spots, adjust travel routes, and add personal notes directly inside our live editor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to plan your next getaway?</h2>
              <p className="cta-subtitle">
                Join thousands of smart travelers planning personalized adventures daily.
              </p>
              <button onClick={() => navigate('/signup')} className="btn btn-primary">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <span className="footer-text">
            &copy; 2026 Planora. Built with passion.
          </span>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
