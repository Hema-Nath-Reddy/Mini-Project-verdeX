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
  process.env.SUPABASE_ANON_KEY
);
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const role = req.body.role || "user"; // 1. Create the user in the authentication system

    const { data: userData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Supabase Sign up error: " + authError.message);
      return res.status(500).json({ error: authError.message });
    }

    const user = userData.user;

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        name: name,
        phone: phone,
        balance: 100,
        created_at: new Date(),
      },
    ]);
    if (profileError) {
      console.error(
        "Error inserting into profiles table:",
        profileError.message
      );
      return res.status(500).json({ error: profileError.message });
    }

    return res.status(201).json({
      message:
        "User signed up successfully and profile created. Please check your email for a confirmation link.",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
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
/* app.post("/api/create-project", upload.any(), async (req, res) => {
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
}); */
app.post("/api/create-carbon-credits", upload.any(), async (req, res) => {
  try {
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

    const verification_document_url = publicUrlData.publicUrl;

    const {
      seller_id,
      price,
      price_per_credit,
      issue_date,
      expiry_date,
      status,
      quantity,
      type,
      trendValue,
      name,
      description,
      location,
    } = req.body;

    const { error } = await supabase.from("carbon_credits").insert({
      seller_id,
      price,
      price_per_credit,
      issue_date,
      expiry_date,
      status,
      quantity,
      verification_document_url: verification_document_url,
      type,
      trendValue,
      name,
      description,
      location,
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
      .eq("status", "available");
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

app.post("/api/buy-carbon-credit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyer_id, seller_id, quantity, amount } = req.body;

    // 1. Mark carbon credit as sold
    const { error: creditError } = await supabase
      .from("carbon_credits")
      .update({ status: "sold" })
      .eq("id", id);

    if (creditError) {
      console.error("Error updating carbon credit:", creditError);
      return res.status(500).json({ error: creditError.message });
    }

    // 2. Fetch buyer balance
    const { data: buyerData, error: buyerFetchError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", buyer_id)
      .single();

    if (buyerFetchError) {
      console.error("Error fetching buyer balance:", buyerFetchError);
      return res.status(500).json({ error: buyerFetchError.message });
    }

    const buyerBalance = buyerData.balance;

    if (buyerBalance < amount) {
      return res.status(400).json({ error: "Buyer has insufficient funds" });
    }

    // 3. Update buyer balance (subtract amount)
    const { error: buyerError } = await supabase
      .from("profiles")
      .update({ balance: buyerBalance - amount })
      .eq("id", buyer_id);

    if (buyerError) {
      console.error("Error updating buyer balance:", buyerError);
      return res.status(500).json({ error: buyerError.message });
    }

    // 4. Fetch seller balance
    const { data: sellerData, error: sellerFetchError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", seller_id)
      .single();

    if (sellerFetchError) {
      console.error("Error fetching seller balance:", sellerFetchError);
      return res.status(500).json({ error: sellerFetchError.message });
    }

    const sellerBalance = sellerData.balance;

    // 5. Update seller balance (add amount)
    const { error: sellerError } = await supabase
      .from("profiles")
      .update({ balance: sellerBalance + amount })
      .eq("id", seller_id)
      .select();

    if (sellerError) {
      console.error("Error updating seller balance:", sellerError);
      return res.status(500).json({ error: sellerError.message });
    }

    // 6. Record transaction
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        buyer_id,
        seller_id,
        credit_id: id,
        quantity,
        amount: amount,
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
