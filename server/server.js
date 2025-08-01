const express = require("express");
const cors = require("cors");
const { client, createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post("/signup", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const role = req.body.role || "user";

    const { data, error } = await supabase.auth.signUp({
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
      user: data.user,
    });
  } catch (e) {
    console.log(e);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});