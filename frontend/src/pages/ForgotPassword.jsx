
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      setMessage(
        data.message ||
          "If an account exists for this email, an OTP will be sent."
      );
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!/^\d{6}$/.test(otp)) {
      setIsError(true);
      setMessage("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage("Password reset successfully! Redirecting to login...");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");

      setTimeout(() => navigate("/login"), 1800);
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

        <h1>{otpSent ? "Verify OTP & Reset" : "Forgot Password?"}</h1>

        <p className="auth-description">
          {otpSent
            ? "Enter the OTP sent to your email and create a new password below."
            : "Enter your registered email address to receive a password reset OTP."}
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

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
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <label htmlFor="reset-email-confirm">Email Address</label>
              <input
                id="reset-email-confirm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="otp">6-Digit OTP</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter OTP from your email"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

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
              {loading ? "Verifying..." : "Verify OTP & Reset Password"}
            </button>

            <button
              type="button"
              className="learn-button"
              style={{ width: "100%", marginTop: "12px" }}
              disabled={loading}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setMessage("");
                setIsError(false);
              }}
            >
              Change Email / Request Another OTP
            </button>
          </form>
        )}

        <p className="switch-auth">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
