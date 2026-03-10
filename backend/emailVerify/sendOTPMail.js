import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetOTPEmail = async (otp, email) => {
  console.log("Sending password reset OTP via Resend to:", email);

  try {
    const result = await resend.emails.send({
      from: "AllinOneBazar <onboarding@resend.dev>",
      to: email,
      subject: "AllinoneBazar Reset Password OTP",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Dear User,</p>
        <p>Your OTP for password reset is:</p>
        <h1 style="color:#f97316;letter-spacing:5px;">${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
        <p>Best regards, Team AllinoneBazar</p>
      `
    });
    
    console.log("Password reset OTP email sent successfully:", result.data?.id);
    return result;
  } catch (error) {
    console.error("Resend error:", error.message);
    throw error;
  }
};

export default sendResetOTPEmail;
