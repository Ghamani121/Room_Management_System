import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP config
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS  // your email password / app password
  }
});

export async function sendWelcomeEmail(userEmail: string, password: string) {
  const mailOptions = {
    from: `"Room Booking System" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: "Your Account has been created",
    html: `
      <h2>Welcome to Room Booking System</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please login and change your password immediately.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}
