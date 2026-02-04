import { Resend } from "resend";
import { env } from "@sc-auth/env/server";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = "auth@notify.safecircle.tech";

interface SendOTPEmailParams {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

export async function sendOTPEmail({ to, otp, type }: SendOTPEmailParams) {
  const subjects = {
    "sign-in": "Your SafeCircle Sign-In Code",
    "email-verification": "Verify Your SafeCircle Email",
    "forget-password": "Reset Your SafeCircle Password",
  };

  const messages = {
    "sign-in": `Use this code to sign in to your SafeCircle account:`,
    "email-verification": `Use this code to verify your email address:`,
    "forget-password": `Use this code to reset your password:`,
  };

  const subject = subjects[type];
  const message = messages[type];

  const { error } = await resend.emails.send({
    from: `SafeCircle <${FROM_EMAIL}>`,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #18181b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
              SafeCircle
            </h1>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">
              ${message}
            </p>
            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #18181b;">
                ${otp}
              </span>
            </div>
            <p style="color: #71717a; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
              This code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
            &copy; ${new Date().getFullYear()} SafeCircle. All rights reserved.
          </p>
        </body>
      </html>
    `,
    text: `${message}\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.\n\n© ${new Date().getFullYear()} SafeCircle. All rights reserved.`,
  });

  if (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
