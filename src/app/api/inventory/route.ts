import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        if (!adminDb) {
            console.error('Database connection not initialized');
            return NextResponse.json([]);
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query: any = adminDb.collection('inventory');

        if (category) {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.orderBy('name').get();
        const items = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(items);
    } catch (error: any) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        if (!data.name || !data.code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
        }

        const docRef = await adminDb.collection('inventory').add({
            ...data,
            stock: Number(data.stock) || 0,
            unit_price: Number(data.unit_price) || 0,
            total_price: (Number(data.stock) || 0) * (Number(data.unit_price) || 0),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating inventory item:', error);
        return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    }
}
