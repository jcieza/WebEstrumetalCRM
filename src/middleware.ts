import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Clave secreta para validar que la petición viene de Cloudflare
    // Debes configurar esta variable en los Secrets de Firebase App Hosting
    const CLOULDFARE_SECRET = process.env.CLOUDFLARE_SECRET_KEY;
    const incomingSecret = request.headers.get('x-estrumetal-cloudflare-key');

    // Permitir solo si el secreto coincide
    // Nota: Si CLOULDFARE_SECRET no está configurado, permitimos el paso temporalmente 
    // para evitar bloqueo total, pero mostramos un error en logs si fuera posible.
    if (CLOULDFARE_SECRET && incomingSecret !== CLOULDFARE_SECRET) {
        return new NextResponse(
            JSON.stringify({ error: 'Direct access blocked. Please use our official domain.' }),
            { status: 403, headers: { 'content-type': 'application/json' } }
        );
    }

    // Permitir que la petición continúe
    return NextResponse.next();
}

// Configurar en qué rutas se aplica el middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (si quieres saltarte la validación en API, aunque se recomienda dejarla)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - logo-estrumetal.png (o cualquier asset público crítico)
         */
        '/((?!_next/static|_next/image|favicon.ico|logo-estrumetal.png).*)',
    ],
};
