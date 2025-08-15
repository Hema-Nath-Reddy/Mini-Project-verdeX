const express = require("express");
const cors = require("cors");
const { client, createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const role = req.body.role || "user";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
        },
      },
    });
    if (error) {
      console.error("Supabase Sign up error: " + error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message:
        "User signed up successfully. Please check your email for a confirmation link.",
    });
  } catch (e) {
    console.log(e);
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
});
/* 
app.post("/api/logout", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || !sessions[sessionId]) {
      return res.status(400).json({ error: "Invalid session" });
    }

    const refreshToken = sessions[sessionId].refresh_token;

    const adminSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await adminSupabase.auth.admin.signOut(refreshToken);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    delete sessions[sessionId];

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}); */

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
