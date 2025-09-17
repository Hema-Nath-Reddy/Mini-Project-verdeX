const multer = require("multer");
const path = require("path");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
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

// MPIN encryption/decryption functions
const ENCRYPTION_KEY = process.env.MPIN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

function encryptMPIN(mpin) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(mpin, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encrypting MPIN:', error);
    return null;
  }
}

function decryptMPIN(encryptedMPIN) {
  try {
    const textParts = encryptedMPIN.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting MPIN:', error);
    return null;
  }
}

function encryptMPINWithIV(mpin, ivHex) {
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(mpin, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted; // ciphertext only
  } catch (error) {
    console.error('Error encrypting MPIN with IV:', error);
    return null;
  }
}

function verifyMPIN(inputMPIN, storedEncryptedMPIN) {
  try {
    if (!storedEncryptedMPIN || typeof storedEncryptedMPIN !== 'string' || !storedEncryptedMPIN.includes(':')) {
      return false;
    }
    const parts = storedEncryptedMPIN.split(':');
    const ivHex = parts[0];
    const storedCipherHex = parts.slice(1).join(':');
    let normalizedInput = String(inputMPIN).trim();
    // best-effort normalization: ensure only digits 1-6 length
    if (!/^\d{1,6}$/.test(normalizedInput)) return false;

    // If we can decrypt, use original length to preserve leading zeros via padding
    const originalPlain = decryptMPIN(storedEncryptedMPIN);
    if (originalPlain && /^\d{4,6}$/.test(originalPlain) && normalizedInput.length < originalPlain.length) {
      normalizedInput = normalizedInput.padStart(originalPlain.length, '0');
    }

    const recomputedCipherHex = encryptMPINWithIV(normalizedInput, ivHex);
    if (!recomputedCipherHex) return false;
    // constant-time compare
    return crypto.timingSafeEqual(Buffer.from(recomputedCipherHex, 'hex'), Buffer.from(storedCipherHex, 'hex'));
  } catch (error) {
    console.error('Error verifying MPIN:', error);
    return false;
  }
}

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name, phone, mpin } = req.body;
    const role = req.body.role || "user";

    // Validate MPIN
    if (!mpin || mpin.length < 4 || mpin.length > 6) {
      return res.status(400).json({ 
        error: "MPIN is required and must be 4-6 digits" 
      });
    }

    // Encrypt MPIN
    const encryptedMPIN = encryptMPIN(mpin);
    if (!encryptedMPIN) {
      return res.status(500).json({ 
        error: "Failed to encrypt MPIN" 
      });
    }

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
        mpin: encryptedMPIN,
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
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Resend email confirmation for signup
    const { data, error } = await supabase.auth.resendOtp({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: "http://localhost:5173/login",
      },
    });

    if (error) {
      console.error("Resend email error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      message: "Confirmation email sent successfully",
      data 
    });
  } catch (error) {
    console.error("Resend email error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Send password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      console.error("Forgot password error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      message: "Password reset email sent successfully. Please check your email for reset instructions.",
      data 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { access_token, refresh_token, new_password } = req.body;
    
    if (!access_token || !refresh_token || !new_password) {
      return res.status(400).json({ 
        error: "Access token, refresh token, and new password are required" 
      });
    }

    // Set the session with the provided tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // Update the password
    const { data, error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      console.error("Password update error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      message: "Password updated successfully. You can now log in with your new password.",
      data 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get("/api/profile", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Return profile data (excluding sensitive fields if needed)
    return res.status(200).json({
      profile: {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        balance: profile.balance,
        role: profile.role,
        created_at: profile.created_at
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put("/api/profile", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { name, phone, mpin } = req.body;

    // Validate input - role and balance cannot be modified by users
    if (!name && !phone && !mpin) {
      return res.status(400).json({ 
        error: "At least one field (name, phone, mpin) must be provided for update" 
      });
    }

    // Validate MPIN if provided
    if (mpin !== undefined && mpin !== null && mpin !== '') {
      if (typeof mpin !== 'string' || mpin.length < 4 || mpin.length > 6 || !/^\d+$/.test(mpin)) {
        return res.status(400).json({ 
          error: "MPIN must be 4-6 digits" 
        });
      }
    }

    // Prepare update data (excluding role and balance)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    
    // Handle MPIN update with encryption
    if (mpin !== undefined && mpin !== null && mpin !== '') {
      const encryptedMPIN = encryptMPIN(mpin);
      if (!encryptedMPIN) {
        return res.status(500).json({ 
          error: "Failed to encrypt MPIN" 
        });
      }
      updateData.mpin = encryptedMPIN;
    }

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Create notification for MPIN update
    if (mpin !== undefined && mpin !== null && mpin !== '') {
      await createNotification(
        user.id,
        "MPIN Updated",
        "Your MPIN has been successfully updated. Please use your new MPIN for future transactions.",
        "unread"
      );
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        balance: updatedProfile.balance,
        role: updatedProfile.role,
        created_at: updatedProfile.created_at
        // Note: MPIN is not returned in response for security
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get profile by ID (for admin or public profile viewing)
app.get("/api/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    // Fetch profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, phone, role, created_at")
      .eq("id", id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json({
      profile: {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        role: profile.role,
        created_at: profile.created_at
      }
    });
  } catch (error) {
    console.error("Get profile by ID error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Add balance to user profile
app.post("/api/profile/add-balance", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { amount } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: "Valid amount (greater than 0) is required" 
      });
    }

    // Check if amount is within reasonable limits (optional security measure)
    if (amount > 10000) {
      return res.status(400).json({ 
        error: "Amount cannot exceed $10,000 per transaction" 
      });
    }

    // Get current balance
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching current balance:", fetchError);
      return res.status(500).json({ error: "Failed to fetch current balance" });
    }

    if (!currentProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newBalance = currentProfile.balance + amount;

    // Update balance in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ 
        balance: newBalance
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating balance:", updateError);
      return res.status(500).json({ error: "Failed to update balance" });
    }

    // Create notification for balance addition
    await createNotification(
      user.id,
      "Balance Added",
      `Your account has been credited with $${amount}. New balance: $${newBalance}`,
      "unread"
    );

    return res.status(200).json({
      message: "Balance added successfully",
      previous_balance: currentProfile.balance,
      amount_added: amount,
      new_balance: newBalance,
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        balance: updatedProfile.balance,
        role: updatedProfile.role,
        created_at: updatedProfile.created_at
      }
    });
  } catch (error) {
    console.error("Add balance error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Helper function to create notifications
async function createNotification(user_id, subject, message, status = 'unread') {
  try {
    // Try different status values and table names if the default fails
    const statusOptions = ['unread', 'read', 'pending', 'active', 'new', 'completed'];
    const tableNames = ['notifications', 'user_notifications', 'support_requests'];
    
    let success = false;
    
    // Try different table names first
    for (const tableName of tableNames) {
      for (const statusOption of statusOptions) {
        try {
          const { error } = await supabase
            .from(tableName)
            .insert({
              user_id,
              subject,
              message,
              status: statusOption,
              created_at: new Date()
            });

          if (!error) {
            success = true;
            console.log(`Notification created successfully in ${tableName} with status ${statusOption}`);
            break;
          }
        } catch (tableError) {
          // Continue to next option
          continue;
        }
      }
      if (success) break;
    }

    if (!success) {
      console.error("Error creating notification: All table/status combinations failed");
      // Don't fail the main operation, just log the error
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

// Helper function to ensure storage bucket exists
async function ensureBucketExists(bucketName) {
  try {
    // Check if bucket exists using admin client
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist. Creating...`);
      
      // Create bucket using admin client
      const { data, error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: false, // Private bucket for security
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        fileSizeLimit: 52428800 // 50MB limit
      });

      if (createError) {
        console.error("Error creating bucket:", createError);
        // If bucket creation fails, we'll still try to proceed
        // The bucket might exist but not be accessible due to RLS
        console.log("Continuing without bucket creation...");
        return true;
      }

      console.log(`Bucket '${bucketName}' created successfully`);
    }

    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    // Return true to allow the operation to continue
    // The bucket might exist but not be accessible due to RLS
    return true;
  }
}

// Get user notifications
app.get("/api/notifications", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Get query parameters for filtering
    const { status, limit = 50, offset = 0 } = req.query;

    // Build query
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: notifications, error: notificationsError } = await query;

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    return res.status(200).json({
      notifications: notifications || [],
      total: notifications?.length || 0
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    // Update notification status to read
    const { data: updatedNotification, error: updateError } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user can only update their own notifications
      .select()
      .single();

    if (updateError) {
      console.error("Error updating notification:", updateError);
      return res.status(500).json({ error: "Failed to update notification" });
    }

    if (!updatedNotification) {
      return res.status(404).json({ error: "Notification not found or unauthorized" });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification: updatedNotification
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
app.put("/api/notifications/read-all", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Update all user's unread notifications to read
    const { data: updatedNotifications, error: updateError } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("user_id", user.id)
      .eq("status", "unread")
      .select();

    if (updateError) {
      console.error("Error updating notifications:", updateError);
      return res.status(500).json({ error: "Failed to update notifications" });
    }

    return res.status(200).json({
      message: "All notifications marked as read",
      updated_count: updatedNotifications?.length || 0
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({ error: error.message });
  }
});


app.post("/api/create-carbon-credit", upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Ensure the storage bucket exists
    await ensureBucketExists("carbon-credits");

    const file = req.files[0];
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    let verification_document_url = null;

    // Try to upload file to storage
    try {
      const { error: uploadError } = await supabaseAdmin.storage
        .from("carbon-credits")
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Continue without file upload - we'll store a placeholder URL
        verification_document_url = "file_upload_failed";
      } else {
        // Generate signed URL for private access (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
          .from("carbon-credits")
          .createSignedUrl(filename, 3600); // 1 hour expiry

        if (signedUrlError) {
          console.error("Error creating signed URL:", signedUrlError);
          verification_document_url = "url_generation_failed";
        } else {
          verification_document_url = signedUrlData.signedUrl;
        }
      }
    } catch (storageError) {
      console.error("Storage operation failed:", storageError);
      verification_document_url = "storage_error";
    }

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

    const { data: insertedCredit, error } = await supabase.from("carbon_credits").insert({
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
    }).select().single();

    if (error) {
      console.error("Error inserting carbon credits:", error);
      return res.status(500).json({ error: error.message });
    }

    // Create notification for the seller
    await createNotification(
      seller_id,
      "Carbon Credit Submitted for Approval",
      `Your carbon credit "${name}" (${quantity} credits) has been submitted for approval and is pending review.`,
      "unread"
    );

    // Create notification for admin users (assuming admin role exists)
    // Note: You might want to fetch admin users and send notifications to them
    // For now, we'll just log that admin notification should be sent
    console.log(`Carbon credit "${name}" submitted for approval by seller ${seller_id}`);

    return res
      .status(201)
      .json({ 
        message: "Carbon credits created successfully and submitted for approval",
        carbon_credit: insertedCredit
      });
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
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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

    // Generate fresh signed URL for the verification document
    if (data.verification_document_url) {
      // Extract filename from the stored URL
      const urlParts = data.verification_document_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("carbon-credits")
        .createSignedUrl(filename, 3600); // 1 hour expiry

      if (!signedUrlError && signedUrlData) {
        data.verification_document_url = signedUrlData.signedUrl;
      }
    }

    return res.status(200).json({ carbon_credit: data });
  } catch (error) {
    console.error("Error fetching carbon credit:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get fresh signed URL for verification document
app.get("/api/carbon-credit/:id/document", async (req, res) => {
  try {
    const { id } = req.params;
    const { expires_in = 3600 } = req.query; // Allow custom expiry time
    
    // Get carbon credit details
    const { data: creditData, error: fetchError } = await supabase
      .from("carbon_credits")
      .select("verification_document_url")
      .eq("id", id)
      .single();

    if (fetchError || !creditData) {
      return res.status(404).json({ error: "Carbon credit not found" });
    }

    if (!creditData.verification_document_url) {
      return res.status(404).json({ error: "No verification document found" });
    }

    // Extract filename from the stored URL
    const urlParts = creditData.verification_document_url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Generate fresh signed URL with custom expiry
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("carbon-credits")
      .createSignedUrl(filename, parseInt(expires_in)); // Custom expiry time

    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      return res.status(500).json({ error: "Failed to generate document URL" });
    }

    return res.status(200).json({ 
      document_url: signedUrlData.signedUrl,
      expires_in: parseInt(expires_in),
      expires_at: new Date(Date.now() + parseInt(expires_in) * 1000).toISOString()
    });
  } catch (error) {
    console.error("Error generating document URL:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Check if document URL is expired and refresh if needed
app.post("/api/carbon-credit/:id/refresh-document", async (req, res) => {
  try {
    const { id } = req.params;
    const { current_url } = req.body;
    
    // Get carbon credit details
    const { data: creditData, error: fetchError } = await supabase
      .from("carbon_credits")
      .select("verification_document_url")
      .eq("id", id)
      .single();

    if (fetchError || !creditData) {
      return res.status(404).json({ error: "Carbon credit not found" });
    }

    if (!creditData.verification_document_url) {
      return res.status(404).json({ error: "No verification document found" });
    }

    // Extract filename from the stored URL
    const urlParts = creditData.verification_document_url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Generate fresh signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("carbon-credits")
      .createSignedUrl(filename, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      return res.status(500).json({ error: "Failed to generate document URL" });
    }

    return res.status(200).json({ 
      document_url: signedUrlData.signedUrl,
      expires_in: 3600,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      refreshed: true
    });
  } catch (error) {
    console.error("Error refreshing document URL:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/buy-carbon-credit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyer_id, requested_quantity, mpin } = req.body;

    // Validate input
    if (!buyer_id || !requested_quantity || requested_quantity <= 0 || !mpin) {
      return res.status(400).json({ 
        error: "Buyer ID, valid quantity, and MPIN are required" 
      });
    }

    // Normalize and validate MPIN format
    const mpinString = String(mpin).trim();
    if (!/^\d{4,6}$/.test(mpinString)) {
      return res.status(400).json({ 
        error: "MPIN must be 4-6 digits" 
      });
    }

    // 1. Fetch carbon credit details
    const { data: creditData, error: creditFetchError } = await supabase
      .from("carbon_credits")
      .select("*")
      .eq("id", id)
      .eq("status", "available")
      .single();

    if (creditFetchError || !creditData) {
      console.error("Error fetching carbon credit:", creditFetchError);
      return res.status(404).json({ 
        error: "Carbon credit not found or not available" 
      });
    }

    // 2. Validate requested quantity against available quantity
    if (requested_quantity > creditData.quantity) {
      return res.status(400).json({ 
        error: `Requested quantity (${requested_quantity}) exceeds available quantity (${creditData.quantity})` 
      });
    }

    // 3. Calculate amount based on price per credit
    const amount = requested_quantity * creditData.price_per_credit;

    // 4. Fetch buyer profile including balance and MPIN
    const { data: buyerData, error: buyerFetchError } = await supabase
      .from("profiles")
      .select("balance, mpin")
      .eq("id", buyer_id)
      .single();

    if (buyerFetchError) {
      console.error("Error fetching buyer profile:", buyerFetchError);
      return res.status(500).json({ error: buyerFetchError.message });
    }

    if (!buyerData) {
      return res.status(404).json({ error: "Buyer profile not found" });
    }

    // 5. Verify MPIN
    if (!buyerData.mpin) {
      return res.status(400).json({ 
        error: "MPIN not set for this user. Please contact support." 
      });
    }

    const isMPINValid = verifyMPIN(mpinString, buyerData.mpin);
    if (!isMPINValid) {
      return res.status(401).json({ 
        error: "Invalid MPIN. Please check your MPIN and try again." 
      });
    }

    const buyerBalance = buyerData.balance;

    if (buyerBalance < amount) {
      return res.status(400).json({ 
        error: `Insufficient funds. Required: ${amount}, Available: ${buyerBalance}` 
      });
    }

    // 6. Update buyer balance (subtract amount)
    const { error: buyerError } = await supabase
      .from("profiles")
      .update({ balance: buyerBalance - amount })
      .eq("id", buyer_id);

    if (buyerError) {
      console.error("Error updating buyer balance:", buyerError);
      return res.status(500).json({ error: buyerError.message });
    }

    // 7. Fetch seller balance
    const { data: sellerData, error: sellerFetchError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", creditData.seller_id)
      .single();

    if (sellerFetchError) {
      console.error("Error fetching seller balance:", sellerFetchError);
      return res.status(500).json({ error: sellerFetchError.message });
    }

    const sellerBalance = sellerData.balance;

    // 8. Update seller balance (add amount)
    const { error: sellerError } = await supabase
      .from("profiles")
      .update({ balance: sellerBalance + amount })
      .eq("id", creditData.seller_id);

    if (sellerError) {
      console.error("Error updating seller balance:", sellerError);
      return res.status(500).json({ error: sellerError.message });
    }

    // 9. Update carbon credit quantity or mark as sold
    const remainingQuantity = creditData.quantity - requested_quantity;
    let updateData;

    if (remainingQuantity === 0) {
      // All credits sold, mark as sold
      updateData = { status: "sold", quantity: 0 };
    } else {
      // Partial purchase, update quantity
      updateData = { quantity: remainingQuantity };
    }

    const { error: creditUpdateError } = await supabase
      .from("carbon_credits")
      .update(updateData)
      .eq("id", id);

    if (creditUpdateError) {
      console.error("Error updating carbon credit:", creditUpdateError);
      return res.status(500).json({ error: creditUpdateError.message });
    }

    // 10. Record transaction
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        buyer_id,
        seller_id: creditData.seller_id,
        credit_id: id,
        quantity: requested_quantity,
        amount: amount,
        transaction_date: new Date(),
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return res.status(500).json({ error: transactionError.message });
    }

    // 11. Create notifications for buyer and seller
    const statusText = remainingQuantity === 0 ? "completely sold" : "partially sold";
    
    // Notification for buyer
    await createNotification(
      buyer_id,
      "Carbon Credit Purchase Successful",
      `You have successfully purchased ${requested_quantity} carbon credits from "${creditData.name}" for $${amount}.`,
      "unread"
    );

    // Notification for seller
    await createNotification(
      creditData.seller_id,
      "Carbon Credit Sale Notification",
      `Your carbon credit "${creditData.name}" has been ${statusText}. ${requested_quantity} credits were purchased for $${amount}. ${remainingQuantity > 0 ? `${remainingQuantity} credits remain available.` : 'All credits have been sold.'}`,
      "unread"
    );

    return res.status(200).json({ 
      message: "Transaction successful",
      purchased_quantity: requested_quantity,
      amount_paid: amount,
      remaining_credits: remainingQuantity,
      credit_status: remainingQuantity === 0 ? "sold" : "available"
    });
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
    
    // First, get the carbon credit details to find the seller
    const { data: creditData, error: fetchError } = await supabase
      .from("carbon_credits")
      .select("seller_id, name, quantity, status")
      .eq("id", id)
      .single();

    if (fetchError || !creditData) {
      console.error("Error fetching carbon credit:", fetchError);
      return res.status(404).json({ error: "Carbon credit not found" });
    }

    if (creditData.status !== "pending") {
      return res.status(400).json({ error: "Carbon credit is not pending approval" });
    }

    // Update the carbon credit status
    const { data, error } = await supabase
      .from("carbon_credits")
      .update({ status: "available" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating carbon credit:", error);
      return res.status(500).json({ error: error.message });
    }

    // Create notification for the seller
    await createNotification(
      creditData.seller_id,
      "Carbon Credit Approved",
      `Your carbon credit "${creditData.name}" (${creditData.quantity} credits) has been approved and is now available for purchase.`,
      "unread"
    );

    return res.status(200).json({ 
      message: "Project has been approved",
      carbon_credit: data
    });
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
