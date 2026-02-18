import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GRAVATAR_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:3000/api/auth/gravatar/callback';

export async function GET(req: NextRequest) {
    if (!CLIENT_ID) {
        return NextResponse.json({ error: 'Gravatar Client ID not configured' }, { status: 500 });
    }

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/gravatar/callback`;

    const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=auth+gravatar-profile:read+gravatar-profile:manage`;

    return NextResponse.redirect(authUrl);
}
