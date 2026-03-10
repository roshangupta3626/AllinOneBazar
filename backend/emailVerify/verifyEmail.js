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


import nodemailer from "nodemailer";
import { google } from "googleapis";
import "dotenv/config";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const verifyEmail = async (token, email) => {
  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify/${token}`;

  await transporter.sendMail({
    from: `"AllinOneBazar" <${process.env.MAIL_USER}>`,
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
};

export default verifyEmail;