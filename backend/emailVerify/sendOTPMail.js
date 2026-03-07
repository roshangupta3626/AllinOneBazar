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
  
//   // Verify connection before sendingx
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





// import { Resend } from "resend";
// import "dotenv/config";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendResetOTPEmail = async (otp, email) => {

//   try {
//     const response = await resend.emails.send({
//       from: "AllinoneBazar <onboarding@resend.dev>",
//       to: email,
//       subject: "AllinoneBazar Reset Password OTP",
//       html: `
//         <p>Dear User,</p>

//         <p>You requested to reset your password.</p>

//         <h2>${otp}</h2>

//         <p>This OTP will expire in 10 minutes.</p>

//         <br/>
//         <p>Team AllinoneBazar</p>
//       `,
//     });

//     console.log("OTP email sent:", response);

//   } catch (error) {
//     console.error("OTP email error:", error);
//   }
// };

// export default sendResetOTPEmail;



import transporter from "../utils/emailService.js";

const sendResetOTPEmail = async (otp, email) => {

  const mailOptions = {
    from: `"AllinoneBazar" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "AllinoneBazar Reset Password OTP",
    html: `
      <p>Dear User,</p>

      <p>You requested to reset your password.</p>

      <h2>${otp}</h2>

      <p>This OTP will expire in 10 minutes.</p>

      <p>Team AllinoneBazar</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetOTPEmail;