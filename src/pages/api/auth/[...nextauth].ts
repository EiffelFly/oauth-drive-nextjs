import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/drive.metadata.readonly openid",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      console.log("JWT Callback", token, account);

      if (account) {
        token.accessToken = account?.access_token;
        token.refreshToken = account?.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("Token", token);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        session.accessToken = token.accessToken;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        session.refreshToken = token.refreshToken;
      }

      return session;
    },
  },
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.nextauth?.includes("callback") && req.method === "POST") {
    console.log(
      "Handling callback request from my Identity Provider",
      req.body
    );
  }
  return await NextAuth(req, res, authOptions);
}
