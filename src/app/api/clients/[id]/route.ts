import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const clientId = params.id;

        // Fetch Client
        const clientDoc = await adminDb.collection('clients').doc(clientId).get();
        if (!clientDoc.exists) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        const clientData = clientDoc.data();

        // Fetch Contacts
        const contactsSnapshot = await adminDb.collection('contacts')
            .where('clientId', '==', clientId)
            .get();
        const contacts = contactsSnapshot.docs.map(doc => doc.data());

        // Fetch Sales/Quotations
        const salesSnapshot = await adminDb.collection('quotations')
            .where('clientId', '==', clientId)
            .orderBy('issueDate', 'desc')
            .limit(20)
            .get();
        const sales = salesSnapshot.docs.map(doc => doc.data());

        return NextResponse.json({
            id: clientId,
            ...clientData,
            contacts,
            sales
        });
    } catch (error: any) {
        console.error('Error fetching client detail:', error);
        return NextResponse.json({ error: 'Failed to fetch client detail' }, { status: 500 });
    }
}
