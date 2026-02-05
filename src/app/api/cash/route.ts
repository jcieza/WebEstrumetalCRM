import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        if (!adminDb) {
            console.error('Database connection not initialized');
            return NextResponse.json([]);
        }

        const snapshot = await adminDb.collection('cash').orderBy('date', 'desc').get();
        const records = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(records);
    } catch (error: any) {
        console.error('Error fetching cash records:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const docRef = await adminDb.collection('cash').add({
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating cash record:', error);
        return NextResponse.json({ error: 'Failed to create cash record' }, { status: 500 });
    }
}
