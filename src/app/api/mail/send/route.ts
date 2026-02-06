import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    // Inicializar Resend dentro del handler para evitar errores en build si la key no existe
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
        const { to, subject, body, fromName } = await request.json();

        if (!to || !subject || !body) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // Configuración del remitente profesional
        const fromAddress = "ventas@ciaestrumetal.com";
        const displayName = fromName || "Estrumetal CRM";

        const { data, error } = await resend.emails.send({
            from: `${displayName} <${fromAddress}>`,
            to: [to],
            subject: subject,
            text: body,
            // Si el body contiene HTML, podemos usar la propiedad 'html'
            // html: body 
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
