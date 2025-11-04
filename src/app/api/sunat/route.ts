import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ruc = searchParams.get('ruc');

    if (!ruc || ruc.length !== 11) {
      return NextResponse.json(
        { error: 'El RUC debe tener 11 dígitos' },
        { status: 400 }
      );
    }

    // Obtener configuración de variables de entorno
    const apiUrl = process.env.NEXT_PUBLIC_SUNAT_API_URL || 'https://api.apis.net.pe/v1/ruc';
    const token = process.env.NEXT_PUBLIC_RENIEC_API_TOKEN || '';

    // Configurar headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    // Agregar token si está disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Para APIs.net.pe, agregar Referer
    if (apiUrl.includes('apis.net.pe')) {
      headers['Referer'] = 'https://apis.net.pe';
    }

    // Construir URL con parámetros
    const url = new URL(apiUrl);
    url.searchParams.set('numero', ruc);

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
        console.error('Error en API SUNAT:', response.status, errorText);
        
        // Si es 404, intentar diferentes formatos
        if (response.status === 404 && apiUrl.includes('apis.net.pe')) {
          // Intentar con token como parámetro
          if (token) {
            const urlWithToken = new URL(apiUrl);
            urlWithToken.searchParams.set('numero', ruc);
            urlWithToken.searchParams.set('token', token);
            
            const altResponse = await fetch(urlWithToken.toString(), {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Referer': 'https://apis.net.pe',
              },
              signal: controller.signal,
            });
            
            if (altResponse.ok) {
              const altData = await altResponse.json();
              clearTimeout(timeoutId);
              return NextResponse.json(altData);
            }
          }
        }
        
        return NextResponse.json(
          { 
            error: `Error al consultar el RUC: ${response.status} ${response.statusText}`,
            details: errorText || 'Sin detalles adicionales',
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
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: La consulta tardó demasiado');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error en API route de SUNAT:', error);
    
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      return NextResponse.json(
        { error: 'La consulta tardó demasiado. Por favor, intenta nuevamente.' },
        { status: 408 }
      );
    }

    if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { error: 'No se pudo conectar con la API de SUNAT. Verifica tu conexión a internet.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error desconocido al consultar el RUC' },
      { status: 500 }
    );
  }
}

