import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { bearer, captcha, twoFactor } from "better-auth/plugins";

import {
  resetPasswordEmailContent,
  sendEmail,
  verificationEmailContent,
  welcomeEmailContent,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
/** Skip captcha in `next dev` so prod keys in `.env` do not break localhost domains. */
const recaptchaActive =
  Boolean(recaptchaSecret) &&
  (process.env.NODE_ENV === "production" || process.env.RECAPTCHA_FORCE === "true");

/** Comma-separated origins (e.g. chrome-extension://… for the MV3 popup). */
const envTrustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** Mobile / Expo Go schemes (RN fetch has no Origin unless the client sets one). */
const mobileTrustedOrigins = [
  "taskflow://",
  ...(process.env.NODE_ENV !== "production"
    ? ["exp://*", "http://localhost:8081", "http://127.0.0.1:8081"]
    : []),
];

const trustedOrigins = [...new Set([...envTrustedOrigins, ...mobileTrustedOrigins])];

export const auth = betterAuth({
  appName: "TaskFlow",
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-taskflow-secret-change-me-32b",
  trustedOrigins,
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
    twoFactor({
      issuer: "TaskFlow",
    }),
    ...(recaptchaActive
      ? [
          captcha({
            provider: "google-recaptcha",
            secretKey: recaptchaSecret!,
            minScore: 0.5,
          }),
        ]
      : []),
    // nextCookies must be last so Set-Cookie from earlier plugins is forwarded.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
