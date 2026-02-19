import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GRAVATAR_CLIENT_ID;
const REDIRECT_URI = process.env.GRAVATAR_REDIRECT_URI;

export async function GET(req: NextRequest) {
    // Base URL for internal redirects
    let baseUrl: string;
    let redirectUri: string;
    if (REDIRECT_URI) {
        baseUrl = new URL(REDIRECT_URI).origin;
        redirectUri = REDIRECT_URI;
    } else {
        let host = req.headers.get('host') || 'localhost:3000';
        if (host.startsWith('0.0.0.0')) host = host.replace('0.0.0.0', 'localhost');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        baseUrl = `${protocol}://${host}`;
        redirectUri = `${baseUrl}/api/auth/gravatar/callback`;
    }

    if (!CLIENT_ID) {
        console.error('GRAVATAR_CLIENT_ID is not configured in environment variables.');
        return NextResponse.redirect(new URL('/crm/mail?gravatar_status=error&error=not_configured', baseUrl));
    }

    const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=auth+gravatar-profile:read+gravatar-profile:manage&state=${encodeURIComponent(baseUrl)}`;

    const redirectResponse = NextResponse.redirect(authUrl);
    return redirectResponse;
}
