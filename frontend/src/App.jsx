import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

function LandingPage() {
  const [showMessage, setShowMessage] = useState(false);

  const handleStartInterview = () => {
    setShowMessage(true);
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          AI<span>Interview</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="home" className="hero">
        <div className="hero-content">
          <p className="badge">
            AI-POWERED INTERVIEW PRACTICE
          </p>

          <h1>
            Ace Your Next
            <span> Interview</span>
          </h1>

          <p className="description">
            Practice realistic interviews with an AI interviewer,
            receive instant feedback, and improve your confidence
            before the real interview.
          </p>

          <div className="hero-buttons">
            <button
              className="start-button"
              onClick={handleStartInterview}
            >
              Start Interview →
            </button>

            <button
              className="learn-button"
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Learn More
            </button>
          </div>

          {showMessage && (
            <p className="start-message">
              🚀 Interview setup coming next!
            </p>
          )}
        </div>

        {/* Interview Card */}
        <div className="interview-card">
          <div className="card-header">
            <div>
              <p className="small-text">CURRENT SESSION</p>
              <h3>Java Developer Interview</h3>
            </div>

            <div className="status">● Ready</div>
          </div>

          <div className="question-box">
            <p className="small-text">AI INTERVIEWER</p>

            <p className="question">
              "What is the difference between an interface and an
              abstract class in Java?"
            </p>
          </div>

          <div className="score-section">
            <div>
              <p className="small-text">AI SCORE</p>
              <h2>
                8.5<span>/10</span>
              </h2>
            </div>

            <div className="score-circle">85%</div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="features">
        <h2>Everything You Need to Improve</h2>

        <p className="section-description">
          Practice smarter and track your interview performance.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Questions</h3>
            <p>
              Get interview questions tailored to your selected job
              role and experience level.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Instant Feedback</h3>
            <p>
              Receive scores, strengths, weaknesses and suggestions
              after every answer.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Track Progress</h3>
            <p>
              Monitor your performance and see how you improve over
              multiple interviews.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about">
        <p>© 2026 AI Interview Platform</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;