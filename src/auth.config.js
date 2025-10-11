// src/auth.config.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

/** Small helper to check non-empty envs */
const defined = (x) => typeof x === "string" && x.trim().length > 0;

/** Providers (conditionally add Google/GitHub if envs are present) */
const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      await connectDB();
      const { email, password } = credentials ?? {};
      if (!email || !password) return null;

      const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
      if (!user || !user.passwordHash) return null;

      if (!user.emailVerifiedAt) {
        // block unverified accounts (adjust message to your UX)
        throw new Error("Email not verified");
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;

      // Return minimal user to seed JWT
      return {
        id: String(user._id),
        name: user.name || "",
        email: user.email,
        image: user.photoURL || null,
        role: user.role || "user",
      };
    },
  }),
];

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

/** @type {import("next-auth").NextAuthOptions} */
const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV !== "production",
  providers,

  callbacks: {
    /** Create/Update user on first OAuth sign-in; keep profile fresh */
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          await connectDB();
          const email = (user?.email || "").toLowerCase();
          if (!email) return false;

          const existing = await User.findOne({ email });

          if (!existing) {
            await User.create({
              name: user.name || profile?.name || email.split("@")[0],
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
            const newPhoto =
              user.image ||
              (account.provider === "github" ? profile?.avatar_url : profile?.picture) ||
              null;
            if (newPhoto && newPhoto !== existing.photoURL) update.photoURL = newPhoto;

            if (Object.keys(update).length) {
              await User.updateOne({ _id: existing._id }, { $set: update });
            }
          }
        }
        return true;
      } catch (e) {
        console.error("[signIn cb]", e);
        return false;
      }
    },

    /** Ensure JWT always carries _id and role */
    async jwt({ token, user }) {
      try {
        await connectDB();

        // First login via Credentials → we set user.id in authorize()
        if (user?.id) {
          token._id = user.id;
          token.email = user.email ?? token.email;
          token.name = user.name ?? token.name;
          token.picture = user.image ?? token.picture ?? null;
          token.role = user.role ?? token.role ?? "user";
          return token;
        }

        // OAuth or subsequent requests → hydrate from DB by email (or keep fresh)
        const email = user?.email || token?.email;
        if (email) {
          const dbUser = await User.findOne({ email: String(email).toLowerCase() })
            .select("_id role name photoURL email")
            .lean();
          if (dbUser) {
            token._id = String(dbUser._id);
            token.role = dbUser.role || token.role || "user";
            token.name = dbUser.name ?? token.name;
            token.picture = dbUser.photoURL ?? token.picture ?? null;
            token.email = dbUser.email ?? token.email;
          }
        }

        // Fallback if nothing else (e.g., initial OAuth where sub exists)
        token._id = token._id || token.sub;
        token.role = token.role || "user";
        return token;
      } catch (e) {
        console.error("[jwt cb]", e);
        return token;
      }
    },

    /** Mirror JWT onto session so requireSession() sees user._id */
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user._id = token?._id;            // ← critical for your guard
          session.user.role = token?.role || "user";
          if (token?.picture) session.user.image = token.picture;
          if (token?.email) session.user.email = token.email;
          if (token?.name) session.user.name = token.name;
        }
        return session;
      } catch (e) {
        console.error("[session cb]", e);
        return session;
      }
    },
  },
};

export default authConfig;
