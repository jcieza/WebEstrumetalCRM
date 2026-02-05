import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        if (!adminDb) {
            console.error('Database connection not initialized');
            return NextResponse.json([]);
        }

        const snapshot = await adminDb.collection('clients').orderBy('name').get();
        const clients = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(clients);
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Simple validation
        if (!data.name || !data.ruc) {
            return NextResponse.json({ error: 'Name and RUC are required' }, { status: 400 });
        }

        const docRef = await adminDb.collection('clients').add({
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
