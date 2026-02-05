import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { client_name } = await req.json();

        if (!client_name) {
            return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-3-flash-preview',
            // No explicit search grounding tool in base SDK yet, 
            // but we can prompt for search-like behavior or use the search tool if configured via system instructions
        });

        const prompt = `
      ACTÚA COMO UN ANALISTA DE INTELIGENCIA COMERCIAL.
      Tu misión es encontrar información detallada de la empresa '${client_name}' en Perú.
      
      Extrae y devuelve ÚNICAMENTE un JSON con:
      1. "ruc": El Registro Único de Contribuyentes (11 dígitos, suele empezar con 20 o 10).
      2. "address": La dirección fiscal completa y actual.
      3. "website": El sitio web oficial (si existe).
      4. "sector": El rubro o actividad principal de la empresa.
      5. "summary": Un resumen estratégico de 1 frase sobre qué hacen.

      Formato JSON:
      {
        "ruc": "",
        "address": "",
        "website": "",
        "sector": "",
        "summary": ""
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Heuristic to find JSON block
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to extract JSON' };

        return NextResponse.json({
            ...data,
            source: "Gemini 1.5 Flash Intelligence"
        });

    } catch (error: any) {
        console.error('Enrichment Error:', error);
        return NextResponse.json({ error: 'Enrichment failed', detail: error.message }, { status: 500 });
    }
}
