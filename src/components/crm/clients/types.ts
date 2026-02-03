export interface ClientContact {
    name?: string;
    dni?: string;
    phone?: string;
    email?: string;
}

export interface ClientSale {
    ID_COTIZACION: string;
    FECHA_EMISION: string;
    RESUMEN_MARKETING: string;
    ESTADO_PROBABLE: string;
}

export interface ClientDNA {
    preferences: string[];
    segment: string;
}

export interface Client {
    id: string;
    name: string;
    ruc?: string;
    address?: string;
    contacts: ClientContact[];
    sales: ClientSale[];
    dna: ClientDNA;
    alert?: {
        type: 'danger' | 'success';
        message: string;
    };
}
