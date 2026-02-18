import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GRAVATAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAVATAR_CLIENT_SECRET;
// Redir URI is constructed dynamically in the handler

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/gravatar/callback`;

    if (!code) {
        return NextResponse.redirect(new URL('/crm/mail?gravatar_status=error&error=no_code', req.url));
    }

    try {
        const response = await fetch('https://public-api.wordpress.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID!,
                client_secret: CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        const data = await response.json();

        if (data.access_token) {
            // Store token in a cookie that expires in 14 days
            const res = NextResponse.redirect(new URL('/crm/mail?gravatar_status=success', req.url));
            res.cookies.set('gravatar_token', data.access_token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 14,
                httpOnly: false, // Allow client-side access for API calls if needed, or keeping it true for security
                sameSite: 'lax',
            });
            return res;
        } else {
            return NextResponse.redirect(new URL(`/crm/mail?gravatar_status=error&error=${data.error}`, req.url));
        }
    } catch (error) {
        console.error('Gravatar Callback Error:', error);
        return NextResponse.redirect(new URL('/crm/mail?gravatar_status=error', req.url));
    }
}
