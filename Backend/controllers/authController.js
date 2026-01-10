import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

const pendingUsers = {}; // In-memory store: { email: { name, password, role, code } }

// =======================
// @desc   Send verification code
// @route  POST /api/auth/register
// @access Public
// =======================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1️⃣ Check if user exists in DB
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // 2️⃣ Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // 3️⃣ Store in memory
    pendingUsers[email] = { name, email, password, role, code };

    // 4️⃣ Send code via email
    const message = `
      <h2>Doctor Appointment System</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
    `;
    await sendEmail(email, "Email Verification Code", message);

    res.status(200).json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

// =======================
// @desc   Verify code and create user
// @route  POST /api/auth/verify-email
// @access Public
// =======================
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const pending = pendingUsers[email];
    if (!pending) return res.status(400).json({ message: "No pending verification found" });

    if (pending.code !== code) return res.status(400).json({ message: "Invalid code" });

    // ✅ Create user in DB
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      isVerified: true,
    });

    // ✅ Remove from pending
    delete pendingUsers[email];

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// =======================
// @desc   Login user
// @route  POST /api/auth/login
// @access Public
// =======================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    // Set httpOnly cookie with token
    res.cookie("token", generateToken(user._id, user.role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// @desc   Verify authentication from cookie
// @route  GET /api/auth/verify
// @access Private
// =======================
export const verifyAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
