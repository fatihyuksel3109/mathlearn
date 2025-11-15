import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, code: string, locale: string = 'tr') {
  const isTurkish = locale === 'tr';
  
  const subject = isTurkish 
    ? 'MathLearn - E-posta Doğrulama Kodu'
    : 'MathLearn - Email Verification Code';
  
  const html = isTurkish
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff6b9d; font-size: 32px;">🦊 MathLearn</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">E-posta Doğrulama</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Merhaba! MathLearn'e hoş geldin! 🎉
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            E-posta adresini doğrulamak için aşağıdaki 6 haneli kodu kullan:
          </p>
          <div style="background-color: #ff6b9d; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 30px 0;">
            ${code}
          </div>
          <p style="color: #999; font-size: 14px; line-height: 1.6;">
            Bu kod 5 dakika geçerlidir. Eğer bu kodu sen istemediysen, bu e-postayı görmezden gelebilirsin.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 MathLearn - Eğlenceli Matematik Öğrenme</p>
        </div>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff6b9d; font-size: 32px;">🦊 MathLearn</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello! Welcome to MathLearn! 🎉
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Use the following 6-digit code to verify your email address:
          </p>
          <div style="background-color: #ff6b9d; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 30px 0;">
            ${code}
          </div>
          <p style="color: #999; font-size: 14px; line-height: 1.6;">
            This code is valid for 5 minutes. If you didn't request this code, you can ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 MathLearn - Fun Math Learning</p>
        </div>
      </div>
    `;

  try {
    await transporter.sendMail({
      from: `"MathLearn" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

