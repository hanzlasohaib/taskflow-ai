import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? "TaskFlow <onboarding@resend.dev>";

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — logging email instead of sending");
    console.warn(`[email] to=${input.to} subject=${input.subject}`);
    console.warn(`[email] text=${input.text}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export function verificationEmailContent(url: string) {
  return {
    subject: "Verify your TaskFlow email",
    text: `Verify your email by opening this link: ${url}`,
    html: `<p>Welcome to TaskFlow.</p><p><a href="${url}">Verify your email</a></p><p>If you did not create an account, you can ignore this message.</p>`,
  };
}

export function welcomeEmailContent(name: string) {
  return {
    subject: "Welcome to TaskFlow",
    text: `Hi ${name}, your email is verified. Start organizing tasks in TaskFlow.`,
    html: `<p>Hi ${name},</p><p>Your email is verified. Welcome to TaskFlow — you're ready to manage tasks across web, mobile, desktop, and extension.</p>`,
  };
}

export function resetPasswordEmailContent(url: string) {
  return {
    subject: "Reset your TaskFlow password",
    text: `Reset your password by opening this link: ${url}`,
    html: `<p>You requested a password reset.</p><p><a href="${url}">Reset password</a></p><p>If you did not request this, you can ignore this message.</p>`,
  };
}
