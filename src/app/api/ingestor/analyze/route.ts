import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');

        const prompt = `
      ACTÚA COMO UN EXPERTO EN INGENIERÍA METÁLICA Y LOGÍSTICA.
      Analiza el archivo adjunto y extrae:
      1. Material detectado predominante (ej. Plancha de acero, Tubo, etc.)
      2. Peso total estimado en KG (solo el número).
      3. Complejidad de fabricación (Baja, Media, Alta).
      4. Sugerencia estratégica de IA para optimizar la producción.

      Responde únicamente en formato JSON:
      {
        "detected_material": "",
        "weight_kg": 0,
        "complexity": "",
        "ai_suggestion": ""
      }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse AI response' };

        return NextResponse.json({
            filename: file.name,
            ...data
        });

    } catch (error: any) {
        console.error('Error in AI Ingestor:', error);
        return NextResponse.json({ error: 'AI Analysis failed' }, { status: 500 });
    }
}
