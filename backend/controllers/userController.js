import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyEmail from "../emailVerify/verifyEmail.js";
import Session from "../models/sessionModel.js";
import sendResetOTPEmail from "../emailVerify/sendOTPMail.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 1. Create user first
    const user = await User.create({ firstName, lastName, email, password: hashedPassword });

    // 2. Generate token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "10m" });
    user.token = token;
    await user.save();

    // 3. Send email with detailed error logging
    try {
      console.log("Attempting to send verification email...");
      console.log("MAIL_USER:", process.env.MAIL_USER ? "SET" : "NOT SET");
      console.log("MAIL_PASS:", process.env.MAIL_PASS ? "SET" : "NOT SET");
      console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
      
      await verifyEmail(token, email);
      console.log("Verification email sent successfully to:", email);
    } catch (mailError) {
      console.error("=== MAIL SENDING FAILED ===");
      console.error("Error details:", mailError);
      console.error("Error message:", mailError.message);
      console.error("===========================");
      
      // Return a warning to the frontend so user knows email failed
      return res.status(201).json({ 
        success: true, 
        warning: "User registered but verification email could not be sent. Please contact support.",
        emailSent: false,
        user 
      });
    }

    return res.status(201).json({ 
      success: true, 
      message: "User registered successfully. Please check your email.", 
      user 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... keep all your other functions (login, verify, etc.) exactly as they were

export const verify = async (req, res) => {
  try {
    // Get token from query parameter (for GET request from email link)
    const token = req.query.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Registration token has expired" });
      }
      return res.status(401).json({ success: false, message: "Token verification failed" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isVerified = true;
    user.token = null;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Email is already verified" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "10m" });
    
    // Send email with detailed error logging
    try {
      console.log("Attempting to send re-verification email...");
      console.log("MAIL_USER:", process.env.MAIL_USER ? "SET" : "NOT SET");
      console.log("MAIL_PASS:", process.env.MAIL_PASS ? "SET" : "NOT SET");
      
      await verifyEmail(token, email);
      console.log("Re-verification email sent successfully to:", email);
    } catch (mailError) {
      console.error("=== RE-VERIFY MAIL SENDING FAILED ===");
      console.error("Error details:", mailError);
      console.error("Error message:", mailError.message);
      console.error("======================================");
      
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send verification email. Please try again later." 
      });
    }

    user.token = token;
    await user.save();

    res.status(200).json({ success: true, message: "Verification email sent again successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        if (!existingUser.isVerified) {
            return res.status(401).json({ success: false, message: "Email not verified" });
        }

        // Generate tokens
        const accesstoken = jwt.sign(
            { id: existingUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "10d" }
        );
        const refreshtoken = jwt.sign(
            { id: existingUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "30d" }
        );

        // Update user login status
        existingUser.isLoggedIn = true;
        await existingUser.save();

        // Handle session: delete existing session if exists
        const existingSession = await Session.findOne({ userId: existingUser._id });
        if (existingSession) {
            await Session.findByIdAndDelete(existingSession._id);
        }

        // Create new session
        await Session.create({
            userId: existingUser._id,
            token: refreshtoken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        res.status(200).json({
            success: true,
            message: `Login successful ${existingUser.firstName}`,
            userId: existingUser._id,
            accesstoken,
            refreshtoken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const logout = async (req, res) => {
    try {
        const userId = req.user._id; // comes from isAuthenticated middleware
        await Session.deleteMany({ userId });
        await User.findByIdAndUpdate(userId, { isLoggedIn: false });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP for 10 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP email with detailed error logging
        try {
          console.log("Attempting to send password reset OTP...");
          console.log("MAIL_USER:", process.env.MAIL_USER ? "SET" : "NOT SET");
          console.log("MAIL_PASS:", process.env.MAIL_PASS ? "SET" : "NOT SET");
          
          await sendResetOTPEmail(otp, email);
          console.log("Password reset OTP sent successfully to:", email);
        } catch (mailError) {
          console.error("=== FORGOT PASSWORD MAIL SENDING FAILED ===");
          console.error("Error details:", mailError);
          console.error("Error message:", mailError.message);
          console.error("===========================================");
          
          return res.status(500).json({ 
            success: false, 
            message: "Failed to send OTP email. Please try again later." 
          });
        }
        
        return res.status(200).json({ success: true, message: "OTP sent to email" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const { email } = req.params;

        if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ success: false, message: "OTP is not generated or already verified" });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        if (otp !== user.otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const changePassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Email, new password and confirm password are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const allUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



export const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const loggedInUser = req.user;
    const { firstName, lastName, address, city, zipCode, phoneNo, role } = req.body;

    if (loggedInUser._id.toString() !== userIdToUpdate && loggedInUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this profile"
      });
    }

    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublicId;

    if (req.file) {
      if (profilePicPublicId) {
        await cloudinary.uploader.destroy(profilePicPublicId);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.city = city || user.city;
    user.zipCode = zipCode || user.zipCode;
    user.phoneNo = phoneNo || user.phoneNo;
    if (role) user.role = role;
    user.profilePic = profilePicUrl;
    user.profilePicPublicId = profilePicPublicId;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
