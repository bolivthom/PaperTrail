import { redisClient } from "../redis.server";

interface MagicLinkResponse {
    status: 'success' | 'error';
    message?: string;
}

interface MagicLinkEmailResponse {
    state: 'ok' | 'error';
    data: Record<string, string>;
}

export const sendMagicLink = async (email: string): Promise<MagicLinkResponse> => {
    const code = generateOTP(6)

    const currentCode = await redisClient.get(`magic_link:${email}`);

    if (currentCode) {
        return {
            status: 'error',
            message: 'A magic link has already been sent to this email. Please check your inbox.',
        }
    }

    const response: MagicLinkEmailResponse = await fetch(`${process.env.MAIL_SEND_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAIL_SEND_API_KEY}`,
        },
        body: JSON.stringify({
            "body": `Click here to login to your account: https://intellibus.hackathon.webapps.host/login/${email}/${code}`,
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
        await redisClient.set(`magic_link:${email}`, code, "EX", 60 * 5); // Store code in Redis with 5 min expiry
    }

    return {
        status: response?.state  == 'ok' ? 'success' : 'error',
        message: response?.data?.message,
    }
}

export const verifyMagicLink = async (email: string, code: string) => {
    const storedCode = await redisClient.get(`magic_link:${email}`);
    if (!storedCode) {
        return {
            status: 'error',
            message: 'Invalid or expired magic link.',
        };
    }
    
    if (storedCode === code) {
        await redisClient.del(`magic_link:${email}`); // Invalidate the code after successful verification
        return { status: 'success' };
    }

    return  { status: 'error', message: 'Invalid magic link.' };
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
