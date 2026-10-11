```javascript
const bcrypt = require("bcryptjs");
const pool = require("../db");
const crypto = require("crypto");
const { sendOtpEmail } = require("../emailService");

// SIGNUP
const signup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !full_name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email`,
      [full_name.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      message: "Account created successfully!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      message: "Unable to create account. Please try again.",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash
       FROM users
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

// STEP 1: SEND OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT id, email FROM users WHERE LOWER(email) = $1",
      [normalizedEmail]
    );

    const message =
      "If an account exists for this email, an OTP will be sent.";

    if (result.rows.length === 0) {
      return res.status(200).json({ message });
    }

    const user = result.rows[0];
    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    await pool.query(
      `UPDATE users
       SET reset_otp_hash = $1,
           reset_otp_expires = NOW() + INTERVAL '5 minutes',
           reset_otp_attempts = 0,
           password_reset_token_hash = NULL,
           password_reset_token_expires = NULL
       WHERE id = $2`,
      [otpHash, user.id]
    );

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      await pool.query(
        `UPDATE users
         SET reset_otp_hash = NULL,
             reset_otp_expires = NULL,
             reset_otp_attempts = 0
         WHERE id = $1`,
        [user.id]
      );

      console.error("OTP email delivery failed:", emailError.message);

      return res.status(503).json({
        message: "Unable to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      message: "Unable to process your request.",
    });
  }
};

// STEP 2: VERIFY OTP
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !/^\d{6}$/.test(String(otp ?? ""))
    ) {
      return res.status(400).json({
        message: "Enter your email and six-digit OTP.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, reset_otp_hash, reset_otp_expires,
              reset_otp_attempts
       FROM users
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Request a new one.",
      });
    }

    const user = result.rows[0];

    if (
      !user.reset_otp_hash ||
      !user.reset_otp_expires ||
      new Date(user.reset_otp_expires).getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    if (user.reset_otp_attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Request a new OTP.",
      });
    }

    const submittedHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const storedHash = Buffer.from(user.reset_otp_hash, "hex");

    if (
      storedHash.length !== 32 ||
      !crypto.timingSafeEqual(
        Buffer.from(submittedHash, "hex"),
        storedHash
      )
    ) {
      await pool.query(
        `UPDATE users
         SET reset_otp_attempts = reset_otp_attempts + 1
         WHERE id = $1
           AND reset_otp_hash = $2
           AND reset_otp_expires > NOW()
           AND reset_otp_attempts < 5`,
        [user.id, user.reset_otp_hash]
      );

      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const updateResult = await pool.query(
      `UPDATE users
       SET reset_otp_hash = NULL,
           reset_otp_expires = NULL,
           reset_otp_attempts = 0,
           password_reset_token_hash = $1,
           password_reset_token_expires =
             NOW() + INTERVAL '10 minutes'
       WHERE id = $2
         AND reset_otp_hash = $3
         AND reset_otp_expires > NOW()
         AND reset_otp_attempts < 5
       RETURNING id`,
      [resetTokenHash, user.id, user.reset_otp_hash]
    );

    if (updateResult.rows.length === 0) {
      return res.status(400).json({
        message: "OTP expired or already used. Request a new one.",
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    return res.status(500).json({
      message: "Unable to verify OTP. Please try again.",
    });
  }
};

// STEP 3: RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof resetToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(resetToken) ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        message:
          "Enter your email, valid reset session, and password of at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_token_expires = NULL,
           reset_otp_hash = NULL,
           reset_otp_expires = NULL,
           reset_otp_attempts = 0
       WHERE LOWER(email) = $2
         AND password_reset_token_hash = $3
         AND password_reset_token_expires > NOW()
       RETURNING id`,
      [passwordHash, normalizedEmail, resetTokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message:
          "Reset session invalid or expired. Please start again.",
      });
    }

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({
      message: "Unable to reset your password. Please try again.",
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
```