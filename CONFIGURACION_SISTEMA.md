# Configuración del Sistema Estrumetal

Este documento registra configuraciones críticas y credenciales (sin secretos) necesarias para el mantenimiento y despliegue del sistema.

## 🚀 Firebase App Hosting

### Backend Principal
- **Nombre del Backend:** `devdealis`
- **Proyecto ID:** `estrumetalonline`
- **Ubicación:** `us-central1`

### Secretos Configurados
| Secreto | Uso |
| :--- | :--- |
| `GRAVATAR_CLIENT_ID` | OAuth Integration con Gravatar |
| `GRAVATAR_CLIENT_SECRET` | OAuth Integration con Gravatar |
| `RESEND_API_KEY` | Servicio de envío de correos |
| `FIREBASE_PRIVATE_KEY` | Acceso Administrative SDK |
| `FIREBASE_CLIENT_EMAIL` | Acceso Administrative SDK |

> [!IMPORTANT]
> Si se añaden nuevos secretos, recordar otorgar permisos al backend `devdealis` usando:
> `firebase apphosting:secrets:grantaccess <SECRETO> --backend devdealis --project estrumetalonline`

## 📊 CRM - Estructura de Costos
- **Fórmula de Colchón:** `Total Materiales = Subtotal * (1 + Colchón)`
- **Persistencia:** LocalStorage (`cost_structure_data_v3`)
- **Valor por defecto:** 0.20 (20%)
