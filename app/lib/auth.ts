import { auth } from "~/auth.server";
import { redisClient } from "../redis.server";
import prisma from "~/prisma.server";
interface MagicLinkResponse {
    status: 'success' | 'error';
    message?: string;
}

export const sendMagicLink = async (email: string, request: Request): Promise<MagicLinkResponse> => {

    const responseStatus = await auth.api.signInMagicLink({
            body: {
                email, // required
            },
            // This endpoint requires session cookies.
            headers: request.headers,
        }).then(() => 'success').catch((error)=> {
            console.log('ERROR', error);
            return 'error'
        });
    
    return {
        status: responseStatus,
        message: responseStatus === 'success' ? 'Link sent successfully.' : 'Failed to send magic link email.',
    }
}

export const verifyMagicLink = async (token: string, request: Request) => {

    const { headers, response: verificationResponse } = await auth.api.magicLinkVerify({
        query: { token }, // callbackURL optional if you redirect yourself
        returnHeaders: true,
        // if you want BA to read IP/UA for logs/rules:
        headers: request.headers,
    });

    if(verificationResponse.user.emailVerified) {
        return {
            status: 'error',
            message: 'Invalid or expired magic link.',
            headers,
            user: verificationResponse.user,
        };
    } else {
        redisClient.get(`magiclink:email:${verificationResponse.user?.email}`).then(async (data) => {
            if (data) {
                const { first_name, last_name } = JSON.parse(data);
                await prisma.user.update({
                    where: { id: verificationResponse.user?.id },
                    data: {
                        first_name,
                        last_name,
                    },
                });
                redisClient.del(`magiclink:email:${verificationResponse.user?.email}`);
            }
        });

        return { status: 'success' };
    }
}

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
