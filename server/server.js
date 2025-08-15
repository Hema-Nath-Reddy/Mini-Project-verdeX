const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { client, createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function uploadProjectPDF(projectKeyPrefix, file) {
  const rand = crypto.randomBytes(8).toString("hex");
  const baseName = file.originalname
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
  const fileName = baseName.endsWith(".pdf") ? baseName : `${baseName}.pdf`;
  const objectPath = `${projectKeyPrefix}/${Date.now()}-${rand}-${fileName}`;
  const { data, error } = await supabase.storage
    .from("Projects")
    .upload(objectPath, file.buffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}
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
          created_at: new Date(),
          balance: 0,
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
app.post("/api/create-project", upload.any(), async (req, res) => {
  try {
    const { name, description, location, seller_id } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files[0]; // Take the first uploaded file regardless of field name
    const ext = path.extname(file.originalname);

    // Create unique filename
    const filename = `${Date.now()}${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("Projects") // your bucket name
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("Projects")
      .getPublicUrl(filename);

    // Save project data to database (if you have a table for it)
    const { error: dbError } = await supabase.from("Projects").insert([
      {
        name,
        description,
        location,
        seller_id,
        verification_document_url: publicUrlData.publicUrl,
      },
    ]);

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(201).json({
      message: "Project created successfully",
      file_url: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
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
