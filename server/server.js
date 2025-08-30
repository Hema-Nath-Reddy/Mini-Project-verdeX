const multer = require("multer");
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
  process.env.SUPABASE_ANON_KEY,
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
app.post("/api/create-project", upload.any(), async (req, res) => {
  try {
    const { name, description, location, seller_id } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files[0];
    const ext = path.extname(file.originalname);

    const filename = `${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("Projects")
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }
    const { data: publicUrlData } = supabase.storage
      .from("Projects")
      .getPublicUrl(filename);

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

app.get("/api/projects", async (req, res) => {
  try {
    const { data, error } = await supabase.from("Projects").select("*");
    if (error) {
      throw error;
    }
    return res.status(200).json({ projects: data });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("Projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      throw error;
    }
    return res.status(200).json({ project: data });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-carbon-credits", async (req, res) => {
  try {
    const {
      project_id,
      seller_id,
      amount,
      price_per_credit,
      issue_date,
      expiry_date,
      status,
      quantity,
    } = req.body;

    const { error } = await supabase.from("carbon_credits").insert({
      project_id,
      seller_id,
      amount,
      price_per_credit,
      issue_date,
      expiry_date,
      status,
      quantity,
    });

    if (error) {
      console.error("Error inserting carbon credits:", error);
      return res.status(500).json({ error: error.message });
    }

    return res
      .status(201)
      .json({ message: "Carbon credits created successfully" });
  } catch (error) {
    console.error("Error creating carbon credits:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/carbon-credits", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("carbon_credits")
      .select("*")
      .eq("status", "active");
    if (error) {
      throw error;
    }
    return res.status(200).json({ carbon_credits: data });
  } catch (error) {
    console.error("Error fetching carbon credits:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/carbon-credit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("carbon_credits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }
    return res.status(200).json({ carbon_credit: data });
  } catch (error) {
    console.error("Error fetching carbon credit:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/buy-carbon-credit", async (req, res) => {
  try {
    const { carbon_credit_id, buyer_id, quantity, seller_id, amount } =
      req.body;

    const { error } = await supabase
      .from("carbon_credits")
      .eq("id", carbon_credit_id)
      .update({
        status: "sold",
      });
    if (error) {
      console.error("Error updating carbon credit:", error);
      return res.status(500).json({ error: error.message });
    }
    const { error: buyerError } = await supabase
      .from("auth.users")
      .eq("id", buyer_id)
      .update({
        balance: balance - amount,
      });
    if (buyerError) {
      console.error("Error updating buyer balance:", buyerError);
      return res.status(500).json({ error: buyerError.message });
    }

    const { error: sellerError } = await supabase
      .from("auth.users")
      .eq("id", seller_id)
      .update({
        balance: balance - amount,
      });
    if (sellerError) {
      console.error("Error updating seller balance:", sellerError);
      return res.status(500).json({ error: sellerError.message });
    }

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        buyer_id: buyer_id,
        seller_id: seller_id,
        credit_id: carbon_credit_id,
        quantity: quantity,
        total_price: amount,
        transaction_date: new Date(),
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return res.status(500).json({ error: transactionError.message });
    }
    return res.status(200).json({ message: "Transaction successful" });
  } catch (error) {
    console.error("Error buying carbon credit:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const { data, error } = await supabase.from("transactions").select("*");
    if (error) {
      throw error;
    }
    return res.status(200).json({ transactions: data });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id);
    if (error) {
      throw error;
    }
    return res.status(200).json({ transactions: data });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/support-request", async (req, res) => {
  try {
    const { user_id, subject, message, status } = req.body;
    const { error } = await supabase.from("support_requests").insert({
      user_id,
      subject,
      message,
      status,
      created_at: new Date(),
    });
    if (error) {
      console.error("Error creating support request:", error);
      return res.status(500).json({ error: error.message });
    }
    return res
      .status(201)
      .json({ message: "Support request created successfully" });
  } catch (error) {
    console.error("Error creating support request:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/support-requests", async (req, res) => {
  try {
    const { data, error } = await supabase.from("support_requests").select("*");
    if (error) {
      throw error;
    }
    return res.status(200).json({ support_requests: data });
  } catch (error) {
    console.error("Error fetching support requests:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/support-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .eq("id", id);
    if (error) {
      throw error;
    }
    return res.status(200).json({ support_request: data });
  } catch (error) {
    console.error("Error fetching support request:", error);
    return res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
