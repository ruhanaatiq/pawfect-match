import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export const runtime = "nodejs"; // required for DB work (not Edge)

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    // Email + password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectDB();
        const { email, password } = credentials || {};
        if (!email || !password) return null;

        const user = await User.findOne({ email }).lean();
        if (!user || !user.passwordHash) return null;

        // Block unverified accounts (OTP flow)
        if (!user.emailVerifiedAt) {
          throw new Error("Email not verified");
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.photoURL || null,
          role: user.role || "user",
        };
      },
    }),

    // Google (optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || "",
    }),
  ],

  callbacks: {
    // Create/link a User on first OAuth sign-in and mark verified
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        await connectDB();
        const email = (user?.email || "").toLowerCase();
        if (!email) return false; // need an email to proceed

        const existing = await User.findOne({ email });
        if (!existing) {
          await User.create({
            name: user.name || profile?.name || "User",
            email,
            photoURL:
              user.image ||
              (account.provider === "github" ? profile?.avatar_url : profile?.picture) ||
              null,
            emailVerifiedAt: new Date(), // OAuth email is verified by provider
            role: "user",
          });
        } else {
          const update = {};
          if (!existing.emailVerifiedAt) update.emailVerifiedAt = new Date();
          if (user.name && user.name !== existing.name) update.name = user.name;
          if (user.image && user.image !== existing.photoURL) update.photoURL = user.image;
          if (Object.keys(update).length) {
            await User.updateOne({ _id: existing._id }, { $set: update });
          }
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // On first login, 'user' exists; afterwards we refresh from DB
      if (user) {
        token.role = user.role || token.role || "user";
        token.picture = user.image || token.picture || null;
      } else if (token?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.role = dbUser.role || "user";
          token.picture = dbUser.photoURL || token.picture || null;
          token.name = dbUser.name || token.name;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.role) session.user.role = token.role;
      if (token?.picture) session.user.image = token.picture;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
