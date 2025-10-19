import { auth } from "~/auth.server";
import prisma from "~/prisma.server";

interface UserCreateParams {
    email: string;
    first_name?: string;
    last_name?: string;
}

export async function createUser(params: UserCreateParams) {
    const response = await prisma.user.create({
        data: params
    }).then(user => user).catch(error => {
        return null;
    });
    
    if (!response) {
        // Handle user creation error
        return {
            status: 'error',
            message: 'Failed to create user',
        };
    }

    // Implementation for creating a user
    return {
        status: 'success',
        message: 'User created successfully',
        data: response
    };
}

export async function getUserFromRequest(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return { user: null };
    return { user: session.user };
}