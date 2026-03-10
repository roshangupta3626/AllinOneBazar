// import nodemailer from "nodemailer";
// import "dotenv/config";

// const sendResetOTPEmail = async (otp, email) => {
//   console.log("Creating OTP email transporter...");
  
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//   });

//   console.log("Verifying OTP SMTP connection...");
  
//   await transporter.verify();
//   console.log("OTP SMTP connection verified!");

//   const mailOptions = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: "AllinoneBazar Reset Password OTP",
//     html: `<p>Dear User,</p>
// <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
// <p><b>${otp}</b></p>

// Best regards,
// Team AllinoneBazar`,
//   };

//   console.log("Sending OTP email to:", email);
//   await transporter.sendMail(mailOptions);
//   console.log("Reset OTP email sent successfully");
// };

// export default sendResetOTPEmail;




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

const sendResetOTPEmail = async (otp, email) => {
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

  await transporter.sendMail({
    from: `"AllinOneBazar" <${process.env.MAIL_USER}>`,
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
};

export default sendResetOTPEmail;