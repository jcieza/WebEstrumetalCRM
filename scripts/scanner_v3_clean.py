import os
import re
import json

TARGET_DIRS = [
    r'c:\Users\BENJI\Documents\Obsidian Estrumetal\drive',
    r'c:\Users\BENJI\Documents\Obsidian Estrumetal\Playgraund'
]

RUC_PATTERN = re.compile(r'\b(10|20)\d{9}\b')
PHONE_PATTERN = re.compile(r'\b9\d{8}\b')

JUNK_KEYWORDS = [
    'COTIZACION', 'FABRICACION', 'SERVICIO', 'PINTADO', 'CORTE', 'DOBLES',
    'JAULAS', 'POSTURA', 'LEVANTE', 'MODULOS', 'REAJUSTE', 'FORMATO',
    'PINTURA', 'REJILLA', 'Malla', 'TOLVA', 'MUEBLE', 'BASE', 'GANCHERA',
    'EXHIBIDOR', 'CANASTILLA', 'BANDEJA', 'PISOS', 'TECHSO', 'NIVEL'
]

def clean_name(text):
    clean = re.sub(r'\(.*?\)', '', text)
    clean = re.sub(r'COTIZACION\s+N[°ª]\s*[\d-]*', '', clean, flags=re.IGNORECASE)
    clean = clean.split('.')[0]
    for junk in JUNK_KEYWORDS:
        clean = re.sub(rf'\b{junk}\b', '', clean, flags=re.IGNORECASE)
    clean = clean.strip(' -_.,()')
    return clean if len(clean) > 3 else None

def scan_folders():
    print('--- INICIANDO ARQUEOLOGÍA DE DATOS V3 ---')
    raw_leads = []
    for base_dir in TARGET_DIRS:
        if not os.path.exists(base_dir): continue
        print(f'Escaneando: {base_dir}')
        for root, dirs, files in os.walk(base_dir):
            folder_name = os.path.basename(root)
            ruc_match = RUC_PATTERN.search(folder_name)
            phone_match = PHONE_PATTERN.search(folder_name)
            for filename in files:
                file_ruc = RUC_PATTERN.search(filename)
                file_phone = PHONE_PATTERN.search(filename)
                potential_name = clean_name(filename)
                if file_ruc or file_phone or potential_name:
                    lead = {
                        'source_path': os.path.join(root, filename),
                        'detected_ruc': file_ruc.group(0) if file_ruc else (ruc_match.group(0) if ruc_match else None),
                        'detected_phone': file_phone.group(0) if file_phone else (phone_match.group(0) if phone_match else None),
                        'potential_name': potential_name,
                        'filename': filename
                    }
                    raw_leads.append(lead)
            if len(raw_leads) >= 3000: break
        if len(raw_leads) >= 3000: break
    output_path = r'c:\Users\BENJI\Documents\Obsidian Estrumetal\estrumetal-app\scripts\leads_v3.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(raw_leads, f, indent=4, ensure_ascii=False)
    print(f'--- ESCANEO COMPLETADO: {len(raw_leads)} LEADS ENCONTRADOS ---')

if __name__ == '__main__':
    scan_folders()