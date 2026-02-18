# 📱 Guía de Configuración: WhatsApp CRM x Evolution API

Esta guía detalla los pasos para vincular tu cuenta de WhatsApp WhatsApp Business al CRM de Estrumetal utilizando **Evolution API**.

## 1. Acceder a la Configuración
Para comenzar la vinculación, no puedes hacerlo directamente desde la pestaña de Mensajes si no estás conectado.
- Ve a la **Barra Lateral Izquierda**.
- Haz clic en el ícono de **Configuración** (Engranaje) en la parte inferior.

## 2. Pestaña de Integraciones
Dentro de la pantalla de Configuración:
- Selecciona la opción **"INTEGRACIONES"** en el menú de navegación izquierdo.
- Verás el panel de **"Evolución API (WhatsApp Business)"**.

## 3. Ingresar Credenciales Técnicas
Debes completar los siguientes campos proporcionados por tu administrador de sistemas o proveedor de API:
- **Endpoint URL:** La dirección del servidor donde corre Evolution API (ej: `https://api.tu-servidor.com`).
- **Nombre de Instancia:** El identificador único de tu sesión (ej: `Estrumetal_Ventas`).
- **API Key:** El token de seguridad global para autorizar comandos.

> [!IMPORTANT]
> **Seguridad:** Asegúrate de que tu URL use `https://`. Nunca compartas tu API Key con personal no autorizado.

## 4. Vinculación (Código QR)
Una vez completados los campos:
1. Haz clic en el botón **"INICIAR VINCULACIÓN CON WHATSAPP"**.
2. Aparecerá una ventana con un **Código QR dinámico**.
3. En tu teléfono móvil, abre WhatsApp.
4. Toca en **Dispositivos Vinculados** > **Vincular un dispositivo**.
5. Escanea el código QR que aparece en la pantalla del CRM.

## 5. Verificación
Si el escaneo fue exitoso:
- El estado en configuraciones cambiará a **"Sincronización Activa"** (punto verde).
- Ahora puedes navegar a la pestaña **Mensajes** en la barra lateral para ver tus chats en tiempo real.

---
**¿Necesitas ayuda técnica?** Contacta al equipo de TI de Estrumetal para obtener tus credenciales de Evolution API.
