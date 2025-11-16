import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { createGuest, getGuest } from "./data-service";

const isMockMode = process.env.MOCK_MODE === "true";
const DEMO_COOKIE = "demo-auth";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user, account, profile }) {
      try {
        const existingGuest = await getGuest(user.email);

        if (!existingGuest) {
          await createGuest({ email: user.email, fullName: user.name });
        }

        return true;
      } catch (error) {
        // Keep OAuth sign-in working even if guest sync fails temporarily.
        console.error("Sign in warning (guest sync failed):", error);
        return true;
      }
    },
    async session({ session, user }) {
      if (!session?.user?.email) return session;

      try {
        const guest = await getGuest(session.user.email);
        if (guest) {
          session.user.guestId = guest.id;
        }
        return session;
      } catch (error) {
        console.error("Session error:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};

const {
  auth: baseAuth,
  signIn: baseSignIn,
  signOut: baseSignOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

export async function auth(...args) {
  if (!isMockMode) return baseAuth(...args);

  const isLoggedIn = cookies().get(DEMO_COOKIE)?.value === "1";
  if (!isLoggedIn) return null;

  return {
    user: {
      name: "Demo Guest",
      email: "demo@wildoasis.dev",
      image: "https://api.dicebear.com/8.x/initials/svg?seed=Demo%20Guest",
      guestId: 1,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function signIn(...args) {
  if (!isMockMode) return baseSignIn(...args);
  cookies().set(DEMO_COOKIE, "1", { httpOnly: true, path: "/" });
}

export async function signOut(...args) {
  if (!isMockMode) return baseSignOut(...args);
  cookies().delete(DEMO_COOKIE);
}

export { GET, POST };
