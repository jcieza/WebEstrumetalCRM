/**
 * CLOUDFLARE WORKER SCRIPT
 * Copia este código en tu Cloudflare Worker una vez que lo crees.
 */
export default {
    async email(message, env, ctx) {
        const rawData = await message.raw;
        const readableStream = new Response(rawData).body;

        // Aquí puedes usar un parser si quieres procesar el MIME directamente en el Worker,
        // pero para empezar, simplemente reenviaremos el contenido básico.

        const body = {
            from: message.from,
            to: message.to,
            subject: message.headers.get("subject"),
            body: "Para ver el contenido completo MIME, se requiere un parser adicional en la Function.",
            date: new Date().toISOString()
        };

        // Reenviar a tu Firebase Cloud Function
        const response = await fetch("TU_URL_DE_FIREBASE_FUNCTION", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-estrumetal-token": "TU_TOKEN_SECRETO_AQUI"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error("Error enviando a Firebase:", await response.text());
        }
    }
}
