import { UserData } from '@/types/user';

const API_BASE_URL = 'http://localhost:8000/api';

export async function loginUser(nric: string): Promise<UserData> {
    const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nric }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    return data as UserData;
}

export async function getUserData(): Promise<UserData> {
    const response = await fetch('http://localhost:8000/api/user-data');
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    return data as UserData;
} 