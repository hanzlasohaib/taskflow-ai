import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { bearer, captcha } from "better-auth/plugins";

import {
  resetPasswordEmailContent,
  sendEmail,
  verificationEmailContent,
  welcomeEmailContent,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

/** Comma-separated origins (e.g. chrome-extension://… for the MV3 popup). */
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  appName: "TaskFlow",
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-taskflow-secret-change-me-32b",
  trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : undefined,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const content = resetPasswordEmailContent(url);
      void sendEmail({
        to: user.email,
        ...content,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const content = verificationEmailContent(url);
      void sendEmail({
        to: user.email,
        ...content,
      });
    },
    afterEmailVerification: async (user) => {
      const content = welcomeEmailContent(user.name || "there");
      void sendEmail({
        to: user.email,
        ...content,
      });
    },
  },
  plugins: [
    bearer(),
    ...(recaptchaSecret
      ? [
          captcha({
            provider: "google-recaptcha",
            secretKey: recaptchaSecret,
            minScore: 0.5,
          }),
        ]
      : []),
    // nextCookies must be last so Set-Cookie from earlier plugins is forwarded.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
