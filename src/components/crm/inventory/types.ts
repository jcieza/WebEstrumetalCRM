export interface InventoryItem {
    id: string;
    code: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    unit_price: number;
    total_price?: number;
    condition: string;
    purpose: string;
    storage_years: number;
    warehouse_area: string;
    warehouse_level: number | string;
    location_id: string;
    image_path: string;
    observations: string;
    low_stock: boolean;
    // Special flags from original CRM
    diff_size?: boolean;
    no_use?: boolean;
    unknown?: boolean;
    move_warehouse?: boolean;
}

export type InventoryView = 'list' | 'map';

export interface WarehouseStatus {
    [locationId: string]: {
        items: InventoryItem[];
        total_stock: number;
        has_alert: boolean;
    };
}
