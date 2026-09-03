// Native fetch is used for email Service
import 'dotenv/config';

export const sendOtpEmail = async (toEmail, toName, otp) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const payload = {
    sender: { name: "Movie Booking System", email: process.env.EMAIL_SENDER },
    to: [{ email: toEmail, name: toName }],
    subject: "Your Movie Booking OTP",
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Movie Booking System</h2>
          <p>Hi ${toName},</p>
          <p>Your One-Time Password (OTP) to confirm your booking is:</p>
          <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not initiate this booking, please ignore this email.</p>
        </body>
      </html>
    `
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error('Failed to send OTP email');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Brevo Email Error:', error);
    throw new Error('Failed to send OTP email');
  }
};
