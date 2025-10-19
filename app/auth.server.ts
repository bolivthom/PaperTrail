import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "./prisma.server";
import { emailOTP, magicLink } from "better-auth/plugins";
import { randomUUID } from "crypto";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    user: {
        additionalFields: {
            first_name: { type: "string", input: false, defaultValue: "" },
            last_name: { type: "string", input: false, defaultValue: "" },
        },
    },
    advanced: {
        database: {
        generateId: () => randomUUID(), // <-- 36-char hyphenated UUID
        },
    },
    plugins: [
        magicLink({
            expiresIn: 300,
            generateToken: () => {
                return generateOTP(6);
            },
            // disableSignUp: true,
            sendMagicLink: async ({ email, token, url }, request) => {
                // Implement your email sending logic here
                const response = await fetch(`${process.env.MAIL_SEND_URL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.MAIL_SEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        "body": `Click here to login to your account: https://intellibus.hackathon.webapps.host/api/auth/verify?token=${token}`,
                        "bypass_dupe_log": true,
                        "from_email": "papertrail@fleksite.com",
                        "from_name": "PaperTrail",
                        "mail_from": "ms1.fleeksite.com",
                        "reply_to": "papertrail@fleeksite.com",
                        "subject": "Your One Time Passcode",
                        "to_email": email
                    }),
                }).then(res => res.json()).catch(err => {
                    console.error('Error sending magic link email:', err);
                    return { state: 'error', data: { message: 'Failed to send magic link email.' } };
                });

                if (response.state === 'ok') {
                    console.log(`Magic link email sent successfully to ${email}`);
                } else {
                    throw new Error(`Failed to send magic link email to ${email}: ${response.data.message}`);
                }
            }
        }),
        // emailOTP({ 
        //     async sendVerificationOTP({ email, otp, type }) { 
        //         if (type === "sign-in") { 
        //             // Send the OTP for sign in
        //         } else if (type === "email-verification") { 
        //             // Send the OTP for email verification
        //         } else { 
        //             // Send the OTP for password reset
        //         } 
        //     }, 
        // }) 
    ]
});


export function generateOTP(digits: number): string {
  // Input validation
  if (!Number.isInteger(digits) || digits < 1 || digits > 10) {
    throw new Error('Digits must be a positive integer between 1 and 10');
  }
  
  // Generate a random number with the specified number of digits
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Return as string to preserve leading zeros if needed
  return otp.toString();
}
