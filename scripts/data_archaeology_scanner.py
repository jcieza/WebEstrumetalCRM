import os
import re
import json

TARGET_DIRS = [
    r"c:\Users\BENJI\Documents\Obsidian Estrumetal\drive",
    r"c:\Users\BENJI\Documents\Obsidian Estrumetal\Playgraund"
]

RUC_PATTERN = re.compile(r"\b(10|20)\d{9}\b")
PHONE_PATTERN = re.compile(r"\b9\d{8}\b")

def scan_folders():
    print("--- INICIANDO ARQUEOLOGÍA DE DATOS ---")
    raw_leads = []
    
    for base_dir in TARGET_DIRS:
        if not os.path.exists(base_dir):
            continue
        print(f"Escaneando: {base_dir}")
        for root, dirs, files in os.walk(base_dir):
            folder_name = os.path.basename(root)
            ruc_match = RUC_PATTERN.search(folder_name)
            phone_match = PHONE_PATTERN.search(folder_name)
            
            if ruc_match or phone_match or any(k in folder_name.upper() for k in ["CLIENTE", "PROVEEDOR", "COTIZACION"]):
                lead = {
                    "source_path": root,
                    "folder_name": folder_name,
                    "detected_ruc": ruc_match.group(0) if ruc_match else None,
                    "detected_phone": phone_match.group(0) if phone_match else None,
                    "type": "folder_discovery",
                    "files_count": len(files)
                }
                raw_leads.append(lead)
            
            if len(raw_leads) >= 1000:
                break
        if len(raw_leads) >= 1000:
            break

    output_path = r"c:\Users\BENJI\Documents\Obsidian Estrumetal\estrumetal-app\scripts\raw_archaeology_leads.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(raw_leads, f, indent=4, ensure_ascii=False)
    
    print(f"--- ESCANEO COMPLETADO: {len(raw_leads)} POTENCIALES LEADS ENCONTRADOS ---")

if __name__ == "__main__":
    scan_folders()
