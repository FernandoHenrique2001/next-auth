import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import db from '@/lib/db';
import { compareSync } from "bcrypt-ts"
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/nodemailer';

declare module "next-auth" {
    interface Session {
        user: User & {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            githubProfile?: any
        }
    }
}

const prisma = new PrismaClient();

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    pages: {
        verifyRequest: '/',
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" }

            },
            async authorize(credentials) {
                const email = credentials.email as string
                const password = credentials.password as string
                if (!email || !password) {
                    return null;
                }

                const user = await db.user.findUnique({ where: { email: email } });

                if (!user) {
                    return null;
                }

                const matches = compareSync(password, user.password ?? '');

                if (!matches) {
                    return null;
                }

                return { id: user.id, name: user.name, email: user.email }
            }
        }),
        GithubProvider({
            allowDangerousEmailAccountLinking: true
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            normalizeIdentifier: (identifier: string) => {
                // Get the first two elements only,
                // separated by `@` from user input.
                console.log({ identifier })
                const [local, domain] = identifier.toLowerCase().trim().split("@")
                // The part before "@" can contain a ","
                // but we remove it on the domain part
                const domainSplited = domain.split(",")[0]
                return `${local}@${domainSplited}`

                // You can also throw an error, which will redirect the user
                // to the sign-in page with error=EmailSignin in the URL
                // if (identifier.split("@").length > 2) {
                //   throw new Error("Only one email allowed")
                // }
            },
            sendVerificationRequest: async (params) => {
                const { identifier: to, provider, url, theme } = params
                console.log({ params })
                const { host } = new URL(url)
                const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.EMAIL_SERVER_PASSWORD}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        personalizations: [{ to: [{ email: to }] }],
                        from: { email: provider.from },
                        subject: `Sign in to ${host}`,
                        content: [
                            { type: "text/plain", value: text({ url, host }) },
                            { type: "text/html", value: html({ url, host, theme }) },
                        ],
                    }),
                })
                if (!res.ok) throw new Error("Sendgrid error: " + (await res.text()))
            }
        })

    ],
    callbacks: {
        jwt: async ({ token, profile }) => {

            return { githubProfile: profile, ...token }
        },
        session: async ({ session, token }) => {

            session.user.githubProfile = token.githubProfile
            return session
        },
        redirect: async ({ baseUrl }) => {
            return `${baseUrl}/dashboard`;
        },
    }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function html(params: { url: string; host: string; theme: any }) {
    const { url, host, theme } = params

    const escapedHost = host.replace(/\./g, "&#8203;.")

    const brandColor = theme.brandColor || "#346df1"
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: theme.buttonText || "#fff",
    }

    return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Sign in to <strong>${escapedHost}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                  in Fernando Henrique Gonçalves Pereira</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`
}