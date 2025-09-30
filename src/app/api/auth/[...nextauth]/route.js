// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export const runtime = "nodejs";              // ✅ NextAuth needs Node runtime
export const dynamic = "force-dynamic";       // ✅ avoid caching the auth route in dev/prod

function defined(str) {
  return typeof str === "string" && str.trim().length > 0;
}

// Build providers defensively to avoid init-time crashes
const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      try {
        await connectDB();
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
        if (!user || !user.passwordHash) return null;

        if (!user.emailVerifiedAt) {
          // Bubble a clean error (NextAuth turns this into JSON, not HTML)
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
      } catch (err) {
        console.error("[authorize] error:", err);
        // Returning null → 401 JSON, not an HTML error page
        return null;
      }
    },
  }),
];

// Only push Google/GitHub if envs are present; empty strings can crash init
if (defined(process.env.GOOGLE_CLIENT_ID) && defined(process.env.GOOGLE_CLIENT_SECRET)) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}
if (
  defined(process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID) &&
  defined(process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET)
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

const handler = NextAuth({
  debug: process.env.NODE_ENV !== "production",

  // Auth.js v5 honors NEXTAUTH_URL/AUTH_TRUST_HOST
  session: { strategy: "jwt" },
  providers,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Wrap DB work to prevent HTML error pages
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          await connectDB();
          const email = (user?.email || "").toLowerCase();
          if (!email) return false;

          const existing = await User.findOne({ email });
          if (!existing) {
            await User.create({
              name: user.name || profile?.name || "User",
              email,
              photoURL:
                user.image ||
                (account.provider === "github" ? profile?.avatar_url : profile?.picture) ||
                null,
              emailVerifiedAt: new Date(),
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
      } catch (err) {
        console.error("[signIn cb] error:", err);
        return false; // → JSON error, not HTML
      }
    },

    async jwt({ token, user }) {
      try {
        if (user) {
          token.email = user.email ?? token.email;
          token.name = user.name ?? token.name;
          token.picture = user.image ?? token.picture ?? null;
          token.role = user.role ?? token.role ?? "user";
          return token;
        }
        if (token?.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).lean();
          if (dbUser) {
            token.role = dbUser.role || "user";
            token.picture = dbUser.photoURL ?? token.picture ?? null;
            token.name = dbUser.name ?? token.name;
          }
        }
        return token;
      } catch (err) {
        console.error("[jwt cb] error:", err);
        return token; // keep token; don’t crash the route
      }
    },

    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.role = token?.role || "user";
          if (token?.picture) session.user.image = token.picture;
        }
        return session;
      } catch (err) {
        console.error("[session cb] error:", err);
        return session;
      }
    },
  },
});

export { handler as GET, handler as POST };
