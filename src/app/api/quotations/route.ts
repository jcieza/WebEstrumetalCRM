import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');

        let query: any = adminDb.collection('quotations');

        if (clientId) {
            query = query.where('clientId', '==', clientId);
        }

        const snapshot = await query.orderBy('issueDate', 'desc').get();
        const items = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(items);
    } catch (error: any) {
        console.error('Error fetching quotations:', error);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}
