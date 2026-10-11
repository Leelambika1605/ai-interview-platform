import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (isSignup && password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (isSignup && password.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup
        ? "http://localhost:5000/api/auth/signup"
        : "http://localhost:5000/api/auth/login";

      const payload = isSignup
        ? {
            full_name: fullName.trim(),
            email: email.trim(),
            password,
          }
        : {
            email: email.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isSignup) {
        setMessage(
          data.message || "Account created successfully! Please log in."
        );
        setIsSignup(false);
        setFullName("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      setIsError(true);

      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Check that your backend is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          AI<span>Interview</span>
        </div>

        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>

        <p className="auth-description">
          {isSignup
            ? "Start practicing smarter with AI-powered interviews."
            : "Continue your interview preparation journey."}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {!isSignup && (
            <div
              style={{
                textAlign: "right",
                marginBottom: "16px",
                marginTop: "-8px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Forgot Password?
              </Link>
            </div>
          )}

          {isSignup && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          )}

          {message && (
            <p
              role="status"
              style={{
                color: isError ? "#dc2626" : "#15803d",
                marginBottom: "12px",
              }}
            >
              {message}
            </p>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <p className="switch-auth">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
              setIsError(false);
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isSignup ? " Login" : " Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;