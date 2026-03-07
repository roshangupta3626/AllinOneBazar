// import nodemailer from "nodemailer";
// import "dotenv/config";

// const verifyEmail = async (token, email) => {
//   console.log("Creating email transporter...");
  
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS
//     }
//   });

//   console.log("Verifying SMTP connection...");
  
//   // Verify connection before sending
//   await transporter.verify();
//   console.log("SMTP connection verified!");

//   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
//   const verificationLink = `${frontendUrl}/verify/${token}`;
  
//   console.log("Verification link:", verificationLink);

//   const mailOptions = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: "AllinoneBazar Email Verification",
//     text: `Welcome to AllinoneBazar!

// Thank you for registering. Please verify your email to start shopping:
// ${verificationLink}

// Best regards,
// Team AllinoneBazar`
//   };

//   console.log("Sending email to:", email);
//   await transporter.sendMail(mailOptions);
//   console.log("Email sent successfully");
// };

// export default verifyEmail;





import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const verifyEmail = async (token, email) => {

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify/${token}`;

  try {
    const response = await resend.emails.send({
      from: "AllinoneBazar <onboarding@resend.dev>",
      to: email,
      subject: "AllinoneBazar Email Verification",
      html: `
        <h2>Welcome to AllinoneBazar</h2>
        <p>Thank you for registering.</p>
        <p>Please verify your email by clicking the button below:</p>

        <a href="${verificationLink}" 
        style="padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
        Verify Email
        </a>

        <p>If the button doesn't work, click this link:</p>
        <p>${verificationLink}</p>

        <br/>
        <p>Team AllinoneBazar</p>
      `,
    });

    console.log("Verification email sent:", response);

  } catch (error) {
    console.error("Email error:", error);
  }
};

export default verifyEmail;