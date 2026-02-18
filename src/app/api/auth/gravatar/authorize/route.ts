import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GRAVATAR_CLIENT_ID;

export async function GET(req: NextRequest) {
    if (!CLIENT_ID) {
        console.error('GRAVATAR_CLIENT_ID is not configured in environment variables.');
        return NextResponse.redirect(new URL('/crm/mail?gravatar_status=error&error=not_configured', req.url));
    }

    let host = req.headers.get('host') || 'localhost:3000';
    if (host.startsWith('0.0.0.0')) host = host.replace('0.0.0.0', 'localhost');

    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/gravatar/callback`;

    const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=auth+gravatar-profile:read+gravatar-profile:manage`;

    const redirectResponse = NextResponse.redirect(authUrl);
    return redirectResponse;
}
