export interface GuideItem {
    description: string;
    qty: number;
    price: number;
}

export interface InternalGuide {
    id: string;
    customer_name: string;
    client_id?: string;
    date: string;
    address?: string;
    observations?: string;
    items: GuideItem[];
    delivered_by: string;
    received_by: string;
    receiver_dni?: string;
    is_billed: boolean;
    total_amount: number;
}
