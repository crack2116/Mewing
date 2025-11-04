# Cómo Actualizar las Reglas de Firestore

## ⚠️ IMPORTANTE: El error "Missing or insufficient permissions" se debe a que las reglas de Firestore no están actualizadas en Firebase.

## Pasos para Actualizar las Reglas:

### 1. Abre la Consola de Firebase
Abre este enlace en tu navegador:
```
https://console.firebase.google.com/project/studio-4560916840-4310c/firestore/rules
```

### 2. Copia las Reglas Actualizadas
Abre el archivo `firestore.rules` en tu proyecto y copia TODO su contenido.

### 3. Pega las Reglas en Firebase Console
1. En la consola de Firebase, verás un editor de reglas
2. Selecciona todo el contenido actual (Ctrl+A)
3. Pega las nuevas reglas (Ctrl+V)
4. Haz clic en el botón **"Publicar"** o **"Publish"** (arriba a la derecha)

### 4. Espera la Confirmación
Firebase te mostrará un mensaje confirmando que las reglas se publicaron correctamente.

### 5. Prueba Nuevamente
Vuelve a tu aplicación e intenta guardar un vehículo, conductor o usuario.

## Reglas Actuales (desde firestore.rules):

Las reglas permiten que **cualquier usuario autenticado** pueda crear:
- ✅ Conductores (`drivers`)
- ✅ Vehículos (`vehicles`)
- ✅ Usuarios (`users`)

Para actualizar y eliminar, aún se requiere ser administrador.

## Si el Error Persiste:

1. **Verifica que estés autenticado:**
   - Abre la consola del navegador (F12)
   - Revisa si hay mensajes de autenticación
   - La aplicación debería autenticarte automáticamente como usuario anónimo

2. **Verifica las reglas en Firebase:**
   - Asegúrate de que las reglas se publicaron correctamente
   - Verifica que no haya errores de sintaxis en las reglas

3. **Espera unos segundos:**
   - Las reglas pueden tardar unos segundos en aplicarse completamente

## Nota de Seguridad:

Las reglas actuales permiten que cualquier usuario autenticado pueda crear documentos. Si necesitas más seguridad, puedes:
- Requerir que el usuario tenga un rol específico
- Implementar validación adicional en el código
- Restringir ciertos campos

