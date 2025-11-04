# 🔴 SOLUCIÓN: Error "Missing or insufficient permissions"

## El Problema

El error ocurre porque las **reglas de Firestore en Firebase Console** aún requieren permisos de administrador, pero el código local ya está actualizado para permitir usuarios autenticados.

## ✅ Solución Rápida (3 pasos)

### Paso 1: Abre Firebase Console
Abre este enlace en tu navegador:
```
https://console.firebase.google.com/project/studio-4560916840-4310c/firestore/rules
```

### Paso 2: Copia las Reglas Actualizadas
Abre el archivo `firestore.rules` en tu proyecto y copia **TODO** su contenido (las 110 líneas).

### Paso 3: Pega y Publica
1. En Firebase Console, selecciona todo el texto (Ctrl+A)
2. Pega las nuevas reglas (Ctrl+V)
3. Haz clic en **"Publicar"** o **"Publish"** (botón azul arriba a la derecha)
4. Espera la confirmación

## 🔍 Verificación

Después de publicar, verifica en la consola del navegador (F12):
- Abre la pestaña "Console"
- Intenta guardar un vehículo
- Deberías ver logs como: "Intentando guardar vehículo: { user: '...', isAnonymous: true, db: true }"

## ⚠️ Si Aún No Funciona

### 1. Verifica la Autenticación
En la consola del navegador, ejecuta:
```javascript
console.log('Usuario autenticado:', firebase.auth().currentUser);
```

### 2. Verifica las Reglas Publicadas
En Firebase Console, las reglas deben mostrar:
```
match /vehicles/{vehicleId} {
  allow create: if isSignedIn();  // ← Debe decir esto
}
```

### 3. Recarga la Página
Después de actualizar las reglas, recarga completamente la página (Ctrl+F5).

### 4. Revisa los Logs Detallados
El código ahora muestra información detallada en la consola. Busca:
- "Intentando guardar vehículo"
- "Error completo al crear vehículo"
- Código de error específico

## 📋 Reglas que DEBES tener en Firebase

Las siguientes líneas son críticas:

```
// Vehicles
match /vehicles/{vehicleId} {
  allow get: if isSignedIn();
  allow list: if isSignedIn();
  allow create: if isSignedIn();  // ← ESTA LÍNEA ES CRÍTICA
  allow update: if isSignedIn() && isAdmin();
  allow delete: if isSignedIn() && isAdmin();
}

// Drivers
match /drivers/{driverId} {
  allow get: if isSignedIn();
  allow list: if isSignedIn();
  allow create: if isSignedIn();  // ← ESTA LÍNEA ES CRÍTICA
  allow update: if isSignedIn() && isAdmin();
  allow delete: if isSignedIn() && isAdmin();
}

// Users
match /users/{userId} {
  allow get: if isSignedIn() && (isOwner(userId) || isAdmin());
  allow list: if isSignedIn();
  allow create: if isSignedIn();  // ← ESTA LÍNEA ES CRÍTICA
  allow update: if isSignedIn() && (isOwner(userId) || isAdmin());
  allow delete: if isSignedIn() && (isOwner(userId) || isAdmin());
}
```

## 🆘 Contacto

Si después de seguir estos pasos el problema persiste, comparte:
1. El mensaje de error completo de la consola
2. Una captura de pantalla de las reglas en Firebase Console
3. Los logs que aparecen en la consola del navegador

