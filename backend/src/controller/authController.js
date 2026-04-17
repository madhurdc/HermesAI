import supabase from "../config/supabaseClient.js";

/**
 * POST /api/auth/signup
 * Create a new user account via Supabase Auth.
 */
export const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "" },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Also sign them in immediately
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(200).json({
        message: "Account created. Please sign in.",
        user: data.user,
      });
    }

    return res.status(201).json({
      message: "Account created successfully",
      user: signInData.user,
      session: signInData.session,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Failed to create account" });
  }
};

/**
 * POST /api/auth/login
 * Sign in with email and password.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to sign in" });
  }
};

/**
 * POST /api/auth/logout
 * Sign out the current user (invalidate the token server-side).
 */
export const logout = async (req, res) => {
  try {
    // The token is already extracted in the auth middleware
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Failed to sign out" });
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's info.
 */
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "Failed to get user info" });
  }
};
