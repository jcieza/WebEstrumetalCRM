export type QuotationStatus = 'APROBADA' | 'ENVIADA' | 'BORRADOR' | 'RECHAZADA';

export interface Quotation {
    id: string;
    client: string;
    date: string;
    total: number;
    status: QuotationStatus;
    itemsCount: number;
}

export interface QuotationKPIs {
    total: number;
    approved: number;
    pending: number;
    totalValue: number;
}
