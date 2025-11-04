# Configuración de API RENIEC

Para usar la consulta de DNI con la API de RENIEC, necesitas configurar las variables de entorno.

## Variables de Entorno

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```env
# URL de la API de RENIEC (opcional, tiene un valor por defecto)
NEXT_PUBLIC_RENIEC_API_URL=https://api.apis.net.pe/v1/dni

# Token de autenticación (opcional, depende de tu proveedor de API)
NEXT_PUBLIC_RENIEC_API_TOKEN=tu_token_aqui
```

## Dónde Obtener las Credenciales

### Opción 1: APIs.net.pe (Recomendado para desarrollo/pruebas)

**URL**: `https://api.apis.net.pe/v1/dni`

**Cómo obtener el token**:
1. Visita: https://apis.net.pe/
2. Regístrate para obtener una cuenta gratuita
3. Obtén tu token de API desde el panel de control
4. Usa el token en la variable `NEXT_PUBLIC_RENIEC_API_TOKEN`

**Características**:
- ✅ Gratuita para uso limitado
- ✅ Fácil de configurar
- ✅ No requiere convenio oficial
- ⚠️ Limitaciones de uso según el plan

**Formato de respuesta**:
```json
{
  "nombres": "JUAN CARLOS",
  "apellidoPaterno": "PEREZ",
  "apellidoMaterno": "GONZALEZ",
  "fechaNacimiento": "1990-05-15"
}
```

### Opción 2: API Oficial de RENIEC (Para producción)

**Proceso para obtener acceso oficial**:

1. **Preparar documentación**:
   - Solicitud de Acceso a Servicios en Línea (Anexo 03)
   - Anexo 04 completado y firmado
   - Documentos adicionales según tu caso

2. **Registrar solicitud**:
   - Accede a la Mesa de Partes Virtual de RENIEC
   - Ingresa datos de la persona jurídica (RUC, razón social)
   - Adjunta los documentos requeridos
   - Envía la solicitud

3. **Contacto para consultas**:
   - **Correos**: eherrerac@reniec.gob.pe, ksalazar@reniec.gob.pe, csantacruz@reniec.gob.pe
   - **Teléfonos**: (01) 3152700 o (01) 3154000, anexos 1351, 1362, 1367, 1368
   - **Correos generales**: cel@reniec.gob.pe, helpdesk@reniec.gob.pe

4. **Una vez aprobado**:
   - RENIEC te proporcionará:
     - URL del endpoint de la API
     - `client_id` y `client_secret` para autenticación
   - Configura estos valores en tu `.env.local`

**Requisitos**:
- Convenio firmado con RENIEC
- Cumplimiento de requisitos técnicos
- Certificados digitales
- Servidores adecuados

### Opción 3: Otras APIs de Terceros

Puedes usar cualquier API de consulta DNI que devuelva datos en formato similar:
- Ajusta la URL en `NEXT_PUBLIC_RENIEC_API_URL`
- Configura el token si es necesario
- Ajusta el mapeo de campos en el código si la estructura es diferente

## Validación de Edad

La función valida automáticamente que el usuario sea mayor de 18 años:
- ✅ Si la edad es menor a 18 años, se muestra un error y **no se permite continuar**
- ⚠️ Si no se puede calcular la edad, se muestra una advertencia pero se permite continuar (requiere verificación manual)

## Configuración Rápida (Para Pruebas)

Si solo quieres probar la funcionalidad sin configurar una API real:

1. Crea el archivo `.env.local` en la raíz del proyecto
2. Deja las variables vacías o usa el endpoint por defecto:
```env
NEXT_PUBLIC_RENIEC_API_URL=https://api.apis.net.pe/v1/dni
NEXT_PUBLIC_RENIEC_API_TOKEN=
```

3. La aplicación mostrará un mensaje informativo si la API no está disponible, pero permitirá completar los campos manualmente.

## Nota Importante

⚠️ **RENIEC no proporciona una API pública directa**. Las APIs disponibles son:
- Servicios oficiales de RENIEC (requieren convenio y aprobación)
- Servicios de terceros (apis.net.pe y otros)
- Asegúrate de cumplir con los términos de servicio de tu proveedor de API

