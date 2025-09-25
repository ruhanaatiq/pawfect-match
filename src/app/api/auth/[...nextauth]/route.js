import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
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

        const user = await User.findOne({ email });
        if (!user || !user.passwordHash) return null;

        // Block unverified accounts (since you added OTP)
        if (!user.emailVerifiedAt) {
          // Throwing error lets you show "Email not verified" in the UI
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

    // Optional social providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first login 'user' is present; afterwards only 'token'
      if (user) {
        token.role = user.role || "user";
        token.picture = user.image || null;
      } else if (token?.email) {
        // optional: refresh from DB
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
    signIn: "/login", // use your custom login page
  },
});

export { handler as GET, handler as POST };
