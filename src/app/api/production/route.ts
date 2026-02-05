import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
    try {
        const snapshot = await adminDb.collection('production_orders')
            .orderBy('issueDate', 'desc')
            .get();

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error('Error fetching production orders:', error);
        return NextResponse.json({ error: 'Failed to fetch production orders' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Basic validation
        if (!data.client_id || !data.emission_date) {
            return NextResponse.json({ error: 'Client ID and emission date are required' }, { status: 400 });
        }

        const docRef = await adminDb.collection('production_orders').add({
            ...data,
            status: data.status || 'PENDIENTE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating production order:', error);
        return NextResponse.json({ error: 'Failed to create production order' }, { status: 500 });
    }
}
