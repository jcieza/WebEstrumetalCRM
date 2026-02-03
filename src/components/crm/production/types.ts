export interface ProductionItem {
    description: string;
    qty: number;
    unit: string;
    progress?: {
        packed?: boolean;
    };
    production_comment?: string;
    processes?: {
        name: string;
        completed: boolean;
    }[];
}

export interface ProductionOrder {
    id: string;
    client_id: string;
    client_name: string;
    emission_date: string;
    delivery_date: string;
    priority: 'URGENTE' | 'ALTA' | 'MEDIA' | 'PROGRAMADO';
    status: 'EN PROCESO' | 'PENDIENTE' | 'TERMINADO' | 'ENTREGADO' | 'DETENIDO';
    items: ProductionItem[];
    production_areas?: string[];
    observations?: string;
    work_type?: string;
    general_progress: number;
}
