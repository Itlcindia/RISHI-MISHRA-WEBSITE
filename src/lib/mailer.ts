import nodemailer from 'nodemailer';

interface SendOtpParams {
  to: string;
  adminName: string;
  otp: string;
}

export async function sendOtpEmail({ to, adminName, otp }: SendOtpParams) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Rishi Mishra NGO" <${user || 'no-reply@rishimishra.org'}>`;

  // Fallback if SMTP not configured
  if (!host || !user || !pass) {
    console.warn(`\n======================================================`);
    console.warn(`[MAILER INFO] SMTP credentials not set in .env.`);
    console.warn(`[PASSWORD RESET OTP] For ${adminName} (${to}): >>> ${otp} <<<`);
    console.warn(`======================================================\n`);
    return {
      sent: false,
      fallback: true,
      message: 'SMTP credentials not configured in .env. OTP logged to server console.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase;">
            Admin Portal Verification
          </h1>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">
            Rishi Mishra Social Welfare Initiative
          </p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="font-size: 15px; color: #334155; margin-bottom: 20px;">
            Hello <strong>${adminName}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            A password reset request was initiated for your administrator account. Use the following One-Time Password (OTP) to complete the verification:
          </p>
          
          <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7; display: inline-block;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 8px;">
            ⏰ <strong>Important:</strong> This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            If you did not request this password reset, please ignore this email or review your account security.
          </p>
        </div>
        
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">
            &copy; ${new Date().getFullYear()} Rishi Mishra Foundation. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Admin Security Code: ${otp} - Password Reset Request`,
      text: `Hello ${adminName},\n\nYour One-Time Password (OTP) for admin password reset is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore.\n\nRegards,\nRishi Mishra NGO`,
      html: htmlContent,
    });

    console.log(`[MAILER SUCCESS] OTP sent to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[MAILER ERROR] Failed to send email to ${to}:`, err.message);
    console.warn(`[PASSWORD RESET OTP FALLBACK] >>> ${otp} <<<`);
    return {
      sent: false,
      fallback: true,
      error: err.message,
    };
  }
}
