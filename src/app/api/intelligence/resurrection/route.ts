import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { subMonths, isBefore, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        // 1. Get all clients and sales
        const clientsSnapshot = await adminDb.collection('clients').get();
        const salesSnapshot = await adminDb.collection('quotations').get();

        const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (clients.length === 0 || sales.length === 0) {
            return NextResponse.json({ resurrection: [], frequent: [] });
        }

        const twelveMonthsAgo = subMonths(new Date(), 12);
        const clientsLastSale: Record<string, any> = {};

        // 2. Track last sale per client
        sales.forEach((sale: any) => {
            const saleDate = parseISO(sale.emission_date);
            if (!clientsLastSale[sale.client_id] || isBefore(clientsLastSale[sale.client_id].date, saleDate)) {
                clientsLastSale[sale.client_id] = {
                    date: saleDate,
                    amount: sale.total_amount,
                    id: sale.id
                };
            }
        });

        // 3. Categorize clients
        const resurrection = [];
        const frequent = [];

        for (const client of clients) {
            const lastSale = clientsLastSale[(client as any).id];
            if (lastSale) {
                if (isBefore(lastSale.date, twelveMonthsAgo)) {
                    resurrection.push({
                        id: (client as any).id,
                        name: (client as any).name,
                        last_sale_date: lastSale.date.toISOString().split('T')[0],
                        last_amount: lastSale.amount,
                        category: 'RECUPERABLE'
                    });
                } else {
                    frequent.push({
                        id: (client as any).id,
                        name: (client as any).name,
                        last_sale_date: lastSale.date.toISOString().split('T')[0],
                        total_sales_count: sales.filter((s: any) => s.client_id === (client as any).id).length
                    });
                }
            }
        }

        return NextResponse.json({ resurrection, frequent });
    } catch (error: any) {
        console.error('Error in resurrection algorithm:', error);
        return NextResponse.json({ error: 'Failed to run intelligence analysis' }, { status: 500 });
    }
}
