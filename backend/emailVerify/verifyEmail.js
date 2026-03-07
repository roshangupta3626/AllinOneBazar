import nodemailer from "nodemailer";
import "dotenv/config";

const verifyEmail = async (token, email) => {
  console.log("Creating email transporter...");
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
      port: 587,
      secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  console.log("Verifying SMTP connection...");
  
  // Verify connection before sending
  await transporter.verify();
  console.log("SMTP connection verified!");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify/${token}`;
  
  console.log("Verification link:", verificationLink);

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "AllinoneBazar Email Verification",
    text: `Welcome to AllinoneBazar!

Thank you for registering. Please verify your email to start shopping:
${verificationLink}

Best regards,
Team AllinoneBazar`
  };

  console.log("Sending email to:", email);
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

export default verifyEmail;
