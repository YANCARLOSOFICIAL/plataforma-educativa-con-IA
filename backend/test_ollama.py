"""
Script de prueba para verificar la conexion con Ollama
Ejecutar: python test_ollama.py
"""

import httpx
import asyncio
import json
import sys

# Configurar codificación UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

OLLAMA_URL = "http://localhost:11434"

async def test_ollama():
    print("=" * 60)
    print("PRUEBA DE CONEXIÓN CON OLLAMA")
    print("=" * 60)

    # Test 1: Verificar si Ollama está corriendo
    print("\n1. Verificando si Ollama está corriendo...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                print("✓ Ollama está corriendo correctamente")

                # Mostrar modelos disponibles
                models = response.json()
                print(f"\nModelos disponibles ({len(models.get('models', []))}):")
                for model in models.get('models', []):
                    print(f"  - {model['name']}")
            else:
                print(f"✗ Error: Status code {response.status_code}")
                return False
    except httpx.ConnectError:
        print(f"✗ No se puede conectar a Ollama en {OLLAMA_URL}")
        print("\nPosibles soluciones:")
        print("  1. Asegúrate de que Ollama esté instalado")
        print("  2. Ejecuta 'ollama serve' en otra terminal")
        print("  3. Verifica que el puerto 11434 no esté bloqueado")
        return False
    except Exception as e:
        print(f"✗ Error inesperado: {type(e).__name__}: {str(e)}")
        return False

    # Test 2: Probar generación de texto
    print("\n2. Probando generación de texto...")
    test_model = "qwen2.5vl:latest"  # Cambiar si usas otro modelo

    print(f"   Modelo: {test_model}")
    print("   Prompt: '¿Qué es 2+2?'")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": test_model,
                    "prompt": "¿Qué es 2+2? Responde en una frase corta.",
                    "stream": False,
                    "options": {
                        "temperature": 0.7
                    }
                }
            )

            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "")
                print(f"\n✓ Respuesta generada:")
                print(f"   {generated_text.strip()[:200]}...")
                print(f"\n   Tokens: {result.get('eval_count', 'N/A')}")
                print(f"   Tiempo: {result.get('total_duration', 0) / 1e9:.2f} segundos")
                return True
            elif response.status_code == 404:
                print(f"\n✗ Modelo '{test_model}' no encontrado")
                print(f"\nPara descargar el modelo, ejecuta:")
                print(f"   ollama pull {test_model}")
                return False
            else:
                print(f"\n✗ Error: Status {response.status_code}")
                print(f"   Respuesta: {response.text}")
                return False

    except httpx.TimeoutException:
        print(f"\n✗ Timeout: El modelo tardó más de 60 segundos")
        print("   Esto puede pasar si el modelo es muy grande o tu computadora es lenta")
        return False
    except Exception as e:
        print(f"\n✗ Error: {type(e).__name__}: {str(e)}")
        return False

async def main():
    success = await test_ollama()

    print("\n" + "=" * 60)
    if success:
        print("✓ TODAS LAS PRUEBAS PASARON")
        print("Ollama está listo para usarse con la plataforma educativa")
    else:
        print("✗ ALGUNAS PRUEBAS FALLARON")
        print("Revisa los mensajes de error arriba para solucionar los problemas")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
