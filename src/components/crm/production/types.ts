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
    clientId: string;
    clientName: string;
    issueDate: string;
    deliveryDate: string;
    priority: 'URGENTE' | 'ALTA' | 'MEDIA' | 'PROGRAMADO';
    status: 'EN PROCESO' | 'PENDIENTE' | 'TERMINADO' | 'ENTREGADO' | 'DETENIDO';
    items: ProductionItem[];
    production_areas?: string[];
    observations?: string;
    work_type?: string;
    general_progress: number;
}
