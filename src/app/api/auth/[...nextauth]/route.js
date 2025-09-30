// src/auth.config.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
// import ShelterMember from "@/models/ShelterMember"; // uncomment when you add memberships

const defined = (x) => typeof x === "string" && x.trim().length > 0;

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      await connectDB();
      const { email, password } = credentials ?? {};
      if (!email || !password) return null;
      const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
      if (!user || !user.passwordHash) return null;
      if (!user.emailVerifiedAt) throw new Error("Email not verified");
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
];

if (defined(process.env.GOOGLE_CLIENT_ID) && defined(process.env.GOOGLE_CLIENT_SECRET)) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }));
}
if (defined(process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID) &&
    defined(process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET)) {
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }));
}

const authConfig = {
  debug: process.env.NODE_ENV !== "production",
  trustHost: true, // or set AUTH_TRUST_HOST=true
  secret: process.env.NEXTAUTH_SECRET, // recommended
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
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
              photoURL: user.image ||
                (account.provider === "github" ? profile?.avatar_url : profile?.picture) || null,
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
      } catch (e) {
        console.error("[signIn cb]", e);
        return false;
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

          // OPTIONAL: attach shelter memberships once you have the model
          // const mm = await ShelterMember.find({ userId: dbUser._id }, { shelterId: 1, role: 1 }).lean();
          // token.shelters = mm.map(m => ({ shelterId: String(m.shelterId), role: m.role }));
        }
        return token;
      } catch (e) {
        console.error("[jwt cb]", e);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.role = token?.role || "user";
          if (token?.picture) session.user.image = token.picture;
        }
        // session.shelters = token.shelters || []; // when you add memberships
        return session;
      } catch (e) {
        console.error("[session cb]", e);
        return session;
      }
    },
  },
};

export default authConfig;
