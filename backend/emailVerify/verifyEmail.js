import nodemailer from "nodemailer";
import "dotenv/config";

const verifyEmail = async (token, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "AllinoneBazar Email Verification",
    text: `Welcome to AllinoneBazar!

Thank you for registering. Please verify your email to start shopping:
${process.env.FRONTEND_URL}/verify/${token}

Best regards,
Team AllinoneBazar`
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

export default verifyEmail;
