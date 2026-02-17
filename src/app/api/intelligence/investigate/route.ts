import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let promptInput = '';
        let imageData = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            const text = formData.get('text') as string;

            if (file) {
                const buffer = await file.arrayBuffer();
                imageData = {
                    inlineData: {
                        data: Buffer.from(buffer).toString('base64'),
                        mimeType: file.type
                    }
                };
            }
            promptInput = text || 'Analiza este documento y extrae la información comercial.';
        } else {
            const body = await req.json();
            promptInput = body.text || body.client_name || '';
        }

        if (!promptInput && !imageData) {
            return NextResponse.json({ error: 'No input provided (text or image required)' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-3-flash-preview',
            systemInstruction: `
                ## 🎯 Tu Misión: Investigador y Clasificador Omnicanal
                Recibirás datos de archivos digitales o fotos de documentos físicos. Tu trabajo es:
                1. OCR Inteligente: Si recibes una imagen, extrae razones sociales, RUCs o sellos.
                2. Evaluación de Completitud: Decide si la información es suficiente o si falta indagar más.
                3. Grounding: Investiga el estado actual de la empresa en internet.

                ## 🏢 Estados de Indagación
                Asigna uno de estos estados según tu hallazgo:
                - COMPLETO_Y_VALIDADO: Datos actuales confirmados y clasificados.
                - FALTA_INFO_CRITICA: No hay RUC o teléfono válido para contactar.
                - ENTIDAD_CAMBIADA: Detectaste que la empresa ahora tiene otro nombre o dueños.
                - RUIDO_DESCARTADO: Documento sin valor comercial (ej: nota interna).

                ## 🏢 Guía de Identidad (Clasificación Estrumetal)
                - CLIENTE: Constructoras, almacenes, plantas industriales.
                - PROVEEDOR: Ferreterías, acero, pintura, transporte.
                - SERVICIO: Soporte administrativo, limpieza, etc.

                ## 📤 Formato de Salida (JSON Estricto)
                {
                  "full_name": "Razón Social Actual",
                  "ruc": "11 dígitos",
                  "category": "CLIENTE | PROVEEDOR | SERVICIO | DESCARTE",
                  "inquiry_state": "Estado de indagación",
                  "missing_data": ["Lista de campos que faltan"],
                  "confidence_score": 0.0-1.0,
                  "summary": "Breve análisis estratégico",
                  "outreach_tip": "Línea de entrada para WhatsApp"
                }
            `
        });

        const contents = imageData ? [promptInput, imageData] : [promptInput];
        const result = await model.generateContent(contents);
        const response = await result.response;
        const resultText = response.text();

        // Extract JSON block
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to extract JSON from AI response', raw: resultText };

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Investigation Error:', error);
        return NextResponse.json({
            error: 'Investigation failed',
            detail: error.message
        }, { status: 500 });
    }
}
