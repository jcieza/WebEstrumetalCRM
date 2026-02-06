import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    // Inicializar Resend dentro del handler para evitar errores en build si la key no existe
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
        const { to, subject, body, fromName, fromEmail } = await request.json();

        if (!to || !subject || !body) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // Limpiar y procesar destinatarios (soporta comas)
        const recipients = typeof to === 'string'
            ? to.split(/[;,]/).map(e => e.trim()).filter(Boolean)
            : Array.isArray(to) ? to : [to];

        // Configuración del remitente profesional
        const allowedFroms = ["ventas@ciaestrumetal.com", "administracion@ciaestrumetal.com"];
        let fromAddress = "ventas@ciaestrumetal.com"; // Por defecto

        // Permitir remitente si es de las cuentas oficiales o si pertenece al dominio oficial
        if (fromEmail) {
            if (allowedFroms.includes(fromEmail) || fromEmail.endsWith("@ciaestrumetal.com")) {
                fromAddress = fromEmail;
            }
        }

        const displayName = fromName || "Estrumetal CRM";

        const { data, error } = await resend.emails.send({
            from: `${displayName} <${fromAddress}>`,
            to: recipients,
            subject: subject,
            html: body, // Usamos html en lugar de text para que el logo y firmas funcionen
        });

        if (error) {
            console.error('Error de Resend:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data?.id });

    } catch (err) {
        console.error('Error interno seneding email:', err);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
