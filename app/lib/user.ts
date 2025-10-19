interface UserCreateParams {
    email: string;
    first_name?: string;
    last_name?: string;
}

export async function createUser(params: UserCreateParams) {
    // Implementation for creating a user
    return {
        status: 'success',
        message: 'User created successfully',
        data: { id:  Math.random().toString(36).substr(2, 9), ...params }
    }
}

export async function getUserBySession(sessionId: string) {
    // Implementation for retrieving a user by session ID
    return {
        status: 'success',
        message: 'User retrieved successfully',
        data: { id: 'user123', email: 'woogi@gmail.com', first_name: 'John', last_name: 'Doe' }
    }
}