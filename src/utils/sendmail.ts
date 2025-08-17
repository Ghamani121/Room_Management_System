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




export async function sendPasswordResetEmail(email: string) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Password Reset Required</h2>
      <p>Hello,</p>
      <p>We detected that you logged in with a temporary password. 
      For security reasons, you must reset your password.</p>
      <p>
        <a href="${resetLink}" 
           style="display:inline-block;padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
      </p>
      <p>If you did not attempt to log in, please ignore this email.</p>
      <hr/>
      <small>This is an automated email. Do not reply.</small>
    </div>
  `;

  await transporter.sendMail({
    from: `"Support Team" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset Required",
    html,
  });
}
