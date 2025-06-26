// Auth.ts file is used to initialize the auth library and provide the auth object to the app
import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { admin as adminPlugin, openAPI } from "better-auth/plugins";
import { sendEmail } from "@/server/email";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  appName: "CSR Management System",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      enabled: false,
      trustedProviders: ["google", "github", "microsoft"],
      allowUnlinkingAll: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      disableSignUp: true,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      disableSignUp: true,
    },
  },
  user: {
    additionalFields: {
      theme: {
        type: "string",
        required: false,
        defaultValue: "system",
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [openAPI(), adminPlugin({ ac, roles })],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user, url }) => {
      const title = "Reset Password Request";
      const message = `
		<p>Hello ${user.name},</p>
		<p>A request was made to reset the password for your account.</p>
		<p>
			Click the link below to reset your password:<br/>
			<a href="${url}" target="_blank" style="color: #007BFF;">Click Here</a>
		</p>
		<p>If you didn't request this, you can safely ignore this email.</p>
	`;
      await sendEmail({ subject: title, text: message, to: user.email });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      const title = "Verify Email";
      const message = `
      <p>Hello ${user.name},</p>
      <p>Thank you for signing up!</p>
      <p>
        Please verify your email by clicking the link below:<br/>
        <a href="${url}" target="_blank" style="color: #28A745;">Click Here</a>
      </p>
      <p>If you didn't sign up, you can safely ignore this email.</p>
    `;
      await sendEmail({ subject: title, text: message, to: user.email });
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
