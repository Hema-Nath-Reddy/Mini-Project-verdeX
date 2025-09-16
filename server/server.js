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
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
        role: role,
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

    // Fetch user profile data including role and balance
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    // Combine auth data with profile data
    const userData = {
      ...data.user,
      ...profileData
    };

    return res.status(200).json({
      data: {
        ...data,
        user: userData
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    // 1. Get the current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // User is already logged out or no session exists
      return res.status(200).json({ message: "No active session to log out." });
    }

    // You now have access to the user's unique identifiers
    const userId = user.id;
    const userEmail = user.email;

    console.log(
      `User with ID ${userId} and email ${userEmail} is logging out.`
    );

    // 2. Sign the user out
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Sign out error:", signOutError.message);
      return res.status(500).json({ error: signOutError.message });
    }

    return res.status(200).json({
      message: "Logged out successfully",
      logged_out_user: { id: userId, email: userEmail },
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/resend-email", async (req, res) => {
  try {
    const { email } = req.body;
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: "http://localhost:5173/login",
      },
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.post("/api/create-carbon-credit", upload.any(), async (req, res) => {
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
      quantity,
      verification_document_url: verification_document_url,
      type,
      trendValue: Math.floor(Math.random() * 101), // Random value from 0-100
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

// Temporary endpoint to make a user admin (remove in production)
app.post("/api/make-admin", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user role to admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: 'admin' })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ message: "User role updated to admin successfully" });
  } catch (error) {
    console.error("Error making user admin:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/update-user-role", async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    // Only allow admin users to update roles
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if current user is admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || currentUserProfile.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Update the target user's role
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: role })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/user-profile", async (req, res) => {
  try {
    // Get the current user from the session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch user profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    // Combine auth data with profile data
    const userData = {
      ...user,
      ...profileData
    };

    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
      return res.status(400).json({ 
        error: `Insufficient balance. You need ₹${amount} but have ₹${buyerBalance}` 
      });
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

app.get("/api/dashboard-activity", async (req, res) => {
  try {
    // ---- Fetch recent activities for display ----
    // Fetch recent sign-ups from the profiles table
    const { data: userActivities, error: userError } = await supabase
      .from("profiles")
      .select("name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (userError) throw userError;

    const formattedUsers = userActivities.map((user) => ({
      activityType: "User Account Created",
      description: "User Registration",
      user: user.name,
      timestamp: user.created_at,
    }));

    // Fetch recent transactions
    const { data: transactionActivities, error: transactionError } =
      await supabase
        .from("transactions")
        .select("buyer_id, credit_id, transaction_date")
        .order("transaction_date", { ascending: false })
        .limit(5);

    if (transactionError) throw transactionError;

    const formattedTransactions = transactionActivities.map((transaction) => ({
      activityType: "Credit Purchase",
      description: "Transaction",
      user: transaction.buyer_id, // You may need to join with profiles to get the name
      timestamp: transaction.transaction_date,
    }));

    // Fetch recent project/credit submissions
    const { data: projectActivities, error: projectError } = await supabase
      .from("carbon_credits")
      .select("name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (projectError) throw projectError;

    const formattedProjects = projectActivities.map((project) => ({
      activityType: "Carbon Offset Project Submitted",
      description: "New Project",
      user: "N/A", // You may need to fetch the seller's name
      timestamp: project.created_at,
    }));

    // Combine all activities, sort by timestamp, and send to the client
    const allActivities = [
      ...formattedUsers,
      ...formattedTransactions,
      ...formattedProjects,
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // ---- Fetch dashboard metrics ----

    // Fetch total credits traded (sum of all transaction quantities)
    const { data: creditsData, error: creditsError } = await supabase
      .from("transactions")
      .select("quantity");

    if (creditsError) {
      console.error("Error fetching total credits:", creditsError);
      return res.status(500).json({ error: creditsError.message });
    }

    const totalCreditsTraded = creditsData.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Fetch new users this month
    const today = new Date();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    ).toISOString();

    const { count: newUsersCount, error: usersError } = await supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .gte("created_at", firstDayOfMonth); // Count users created since the start of the month

    if (usersError) {
      console.error("Error fetching new users:", usersError);
      return res.status(500).json({ error: usersError.message });
    }

    // Fetch pending approvals for carbon credits
    const { count: pendingApprovalsCount, error: pendingApprovalsError } =
      await supabase
        .from("carbon_credits")
        .select("id", { count: "exact" })
        .eq("status", "pending");

    if (pendingApprovalsError) {
      console.error("Error fetching pending approvals:", pendingApprovalsError);
      return res.status(500).json({ error: pendingApprovalsError.message });
    }

    // Combine all metrics into a single object
    const dashboardMetrics = {
      totalCreditsTraded: totalCreditsTraded,
      newUsersThisMonth: newUsersCount,
      pendingApprovals: pendingApprovalsCount,
    };

    // Send both metrics and the list of recent activities in the response
    res.status(200).json({
      metrics: dashboardMetrics,
      activities: allActivities,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/dashboard-approvals", async (req, res) => {
  try {
    const { data: projectApprovals, error: projectError } = await supabase

      .from("carbon_credits")

      .select("*")

      .eq("status", "pending")

      .order("created_at", { ascending: false });

    if (projectError) {
      console.error("Error fetching approvals:", projectError);

      return res.status(500).json({ error: projectError.message });
    } // This line is now removed to send all data // const allApprovals = projectApprovals.map((item) => ({ ... })); // Send the full data array directly

    res.status(200).json(projectApprovals);
  } catch (error) {
    console.error("Error fetching approvals:", error);

    res.status(500).json({ error: error.message });
  }
});

app.post("/api/approve-project/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("carbon_credits")
      .update({ status: "available" })
      .eq("id", id);
    if (error) {
      throw error;
    }
    return res.status(200).json({ message: "Project has been approved" });
  } catch (error) {
    console.error("Error approving project:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/all-users", async (req, res) => {
  try {
    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Extract user IDs to fetch profile data in a single query
    const userIds = usersData.users.map((user) => user.id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, role") // Assuming you have a 'role' column in your profiles table
      .in("id", userIds);

    if (profilesError) throw profilesError;

    // Combine user and profile data
    const combinedUsers = usersData.users.map((user) => {
      const profile = profiles.find((p) => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        role: profile ? profile.role : "N/A", // Get role from profiles table
      };
    });

    res.status(200).json(combinedUsers);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
