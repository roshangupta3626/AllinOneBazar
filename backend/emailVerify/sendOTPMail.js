import nodemailer from "nodemailer";
import "dotenv/config";

const sendResetOTPEmail = async (otp, email) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "AllinoneBazar Reset Password OTP",
    html: `<p>Dear User,</p>
<p>You have requested to reset your password. Please use the following OTP to proceed:</p>
<p><b>${otp}</b></p>

Best regards,
Team AllinoneBazar`,
  };

  await transporter.sendMail(mailOptions);
  console.log("Reset OTP email sent successfully");
};

export default sendResetOTPEmail;