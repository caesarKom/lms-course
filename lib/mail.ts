import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "mail.iscode.eu",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail(email: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: '"LMS Platform" <admin@iscode.eu>', // sender address
      to: [email],
      subject: "LMS Platform - Verify your email",
      html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    //
  } catch (err) {
    console.error("Error while sending mail", err);
  }
}
