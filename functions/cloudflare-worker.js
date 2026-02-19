/**
 * CLOUDFLARE WORKER: Ingestor de Correos (Versión Asegurada + Reacciones)
 * 
 * Este worker recibe correos, detecta reacciones de Gmail y los envía al backend de Firebase.
 * Incluye validación por token para el Middleware de Next.js y el ingestor.
 */

export default {
    async email(message, env, ctx) {
        // 1. Configuración de Seguridad y Endpoints
        const firebaseFunctionUrl = "https://ingestemail-s44bgqrkoa-uc.a.run.app";
        const ingestorAuthToken = "estru-secure-2026";
        const cloudflareProxySecret = "EstrumetalSafe-2026-XQ";

        // 2. Procesar contenido y metadatos del correo
        const rawEmail = await new Response(message.raw).text();
        const from = message.from;
        const to = message.to;
        const subject = message.headers.get("subject") || "(Sin Asunto)";
        const date = message.headers.get("date") || new Date().toISOString();
        const contentType = message.headers.get("content-type") || "";

        // 2.5 Detectar si es una Reacción de Gmail
        // El tipo MIME específico es text/vnd.google.email-reaction+json
        const isReaction = rawEmail.includes("text/vnd.google.email-reaction+json");

        // 3. Enviar a Firebase con cabeceras de seguridad
        const response = await fetch(firebaseFunctionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-estrumetal-token": ingestorAuthToken, // Token para la Función
                "x-estrumetal-cloudflare-key": cloudflareProxySecret // Token para el Middleware
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                body: rawEmail,
                date,
                isReaction, // Flag para procesar el emoji en el backend
                contentType
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en Ingestion: ${response.status} - ${errorText}`);
        } else {
            console.log("Correo (y posible reacción) ingerido exitosamente");
        }
    }
}
