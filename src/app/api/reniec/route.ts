import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dni = searchParams.get('dni');

    if (!dni || dni.length !== 8) {
      return NextResponse.json(
        { error: 'El DNI debe tener 8 dígitos' },
        { status: 400 }
      );
    }

    // Obtener configuración de variables de entorno
    let apiUrl = process.env.NEXT_PUBLIC_RENIEC_API_URL || 'https://api.apis.net.pe/v1/dni';
    const token = process.env.NEXT_PUBLIC_RENIEC_API_TOKEN || '';

    // Configurar headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    // Para APIs.net.pe, usar el formato correcto
    if (apiUrl.includes('apis.net.pe')) {
      // Algunas APIs de apis.net.pe requieren el token como parámetro en la URL
      // O usar un formato diferente de URL
      
      // Intentar diferentes formatos de URL
      // Formato 1: https://api.apis.net.pe/v1/dni?numero=12345678
      // Formato 2: https://api.apis.net.pe/v2/dni?numero=12345678
      
      // Probar primero con v1
      if (!apiUrl.includes('/v')) {
        apiUrl = 'https://api.apis.net.pe/v1/dni';
      }
      
      headers['Referer'] = 'https://apis.net.pe';
      
      // Algunas versiones requieren el token en el header Authorization
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      // Para otras APIs, usar Bearer token estándar
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Construir URL con parámetros
    const url = new URL(apiUrl);
    
    // Diferentes APIs pueden usar diferentes nombres de parámetro
    // Probar con 'numero' primero (estándar de apis.net.pe)
    if (!url.searchParams.has('numero')) {
      url.searchParams.set('numero', dni);
    }
    
    // Si la API requiere el token como parámetro, agregarlo
    if (token && apiUrl.includes('apis.net.pe')) {
      // Algunas APIs de apis.net.pe requieren el token como parámetro
      // Intentar primero sin token en URL, luego con token si falla
      // url.searchParams.set('token', token);
    }
    
    console.log('Consultando DNI:', {
      url: url.toString(),
      hasToken: !!token,
      tokenLength: token.length
    });

    // Hacer la petición a la API con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en API RENIEC:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: url.toString()
        });
        
        // Si es 404, intentar diferentes formatos
        if (response.status === 404 && apiUrl.includes('apis.net.pe')) {
          // Intentar 1: Con token como parámetro en la URL
          if (token) {
            const urlWithToken = new URL(apiUrl);
            urlWithToken.searchParams.set('numero', dni);
            urlWithToken.searchParams.set('token', token);
            
            console.log('Intentando con token en URL:', urlWithToken.toString());
            
            const altResponse1 = await fetch(urlWithToken.toString(), {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Referer': 'https://apis.net.pe',
              },
              signal: controller.signal,
            });
            
            if (altResponse1.ok) {
              const altData = await altResponse1.json();
              clearTimeout(timeoutId);
              return NextResponse.json(altData);
            }
          }
          
          // Intentar 2: Con v2
          const altUrl = apiUrl.replace('/v1/', '/v2/');
          const altUrlObj = new URL(altUrl);
          altUrlObj.searchParams.set('numero', dni);
          if (token) {
            altUrlObj.searchParams.set('token', token);
          }
          
          console.log('Intentando con v2:', altUrlObj.toString());
          
          const altResponse2 = await fetch(altUrlObj.toString(), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Referer': 'https://apis.net.pe',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          });
          
          if (altResponse2.ok) {
            const altData = await altResponse2.json();
            clearTimeout(timeoutId);
            return NextResponse.json(altData);
          }
        }
        
        return NextResponse.json(
          { 
            error: `Error al consultar el DNI: ${response.status} ${response.statusText}`,
            details: errorText || 'Sin detalles adicionales',
            suggestion: response.status === 404 ? 'Verifica que el DNI sea válido o que la URL de la API sea correcta' : undefined
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Validar que la respuesta tenga la estructura esperada
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { error: 'Respuesta inválida de la API' },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Si es un error de abort (timeout), lanzarlo para que lo maneje el catch externo
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: La consulta tardó demasiado');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error en API route de RENIEC:', error);
    
    // Manejar diferentes tipos de errores
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      return NextResponse.json(
        { error: 'La consulta tardó demasiado. Por favor, intenta nuevamente.' },
        { status: 408 }
      );
    }

    if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { error: 'No se pudo conectar con la API de RENIEC. Verifica tu conexión a internet.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error desconocido al consultar el DNI' },
      { status: 500 }
    );
  }
}

