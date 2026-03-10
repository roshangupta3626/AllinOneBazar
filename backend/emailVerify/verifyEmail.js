import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const verifyEmail = async (token, email) => {
  console.log("Sending verification email via Resend to:", email);
  
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify/${token}`;

  try {
    const result = await resend.emails.send({
      from: "AllinOneBazar <onboarding@resend.dev>",
      to: email,
      subject: "AllinoneBazar Email Verification",
      html: `
        <h2>Welcome to AllinOneBazar!</h2>
        <p>Thank you for registering. Please verify your email:</p>
        <a href="${verificationLink}" 
           style="background:#f97316;color:white;padding:10px 20px;
           border-radius:5px;text-decoration:none;">
           Verify Email
        </a>
        <p>This link expires in 10 minutes.</p>
        <p>Best regards, Team AllinoneBazar</p>
      `
    });
    
    console.log("Verification email sent successfully:", result.data?.id);
    return result;
  } catch (error) {
    console.error("Resend error:", error.message);
    throw error;
  }
};

export default verifyEmail;
