"""
Script de prueba para verificar que bcrypt funciona correctamente
"""
import sys

print("="*50)
print("Test de Bcrypt - Python 3.13")
print("="*50)
print()

# Test 1: Importar las librerias
print("1. Importando librerias...")
try:
    from passlib.context import CryptContext
    import bcrypt
    print("   [OK] Librerias importadas correctamente")
except ImportError as e:
    print(f"   [ERROR] Error al importar: {e}")
    sys.exit(1)

print()

# Test 2: Crear contexto
print("2. Creando contexto de Passlib...")
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("   ✅ Contexto creado")
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

print()

# Test 3: Función de truncamiento
print("3. Probando función de truncamiento...")
def truncate_password(password: str) -> bytes:
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return password_bytes

try:
    test_pwd = "test123"
    truncated = truncate_password(test_pwd)
    print(f"   Contraseña: '{test_pwd}'")
    print(f"   Bytes: {len(truncated)}")
    print("   ✅ Truncamiento funciona")
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

print()

# Test 4: Hash de contraseña
print("4. Generando hash de contraseña...")
try:
    password = "MiContraseñaSegura123!"
    password_bytes = truncate_password(password)
    hashed = pwd_context.hash(password_bytes)
    print(f"   Contraseña: '{password}'")
    print(f"   Hash: {hashed[:50]}...")
    print("   ✅ Hash generado correctamente")
except Exception as e:
    print(f"   ❌ Error: {e}")
    print(f"   Tipo de error: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# Test 5: Verificación de contraseña
print("5. Verificando contraseña...")
try:
    is_valid = pwd_context.verify(password_bytes, hashed)
    if is_valid:
        print("   ✅ Contraseña verificada correctamente")
    else:
        print("   ❌ Verificación falló")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

print()

# Test 6: Contraseña incorrecta
print("6. Probando contraseña incorrecta...")
try:
    wrong_password = truncate_password("contraseñaIncorrecta")
    is_valid = pwd_context.verify(wrong_password, hashed)
    if not is_valid:
        print("   ✅ Rechazó contraseña incorrecta (correcto)")
    else:
        print("   ❌ Aceptó contraseña incorrecta (incorrecto)")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

print()

# Test 7: Contraseña muy larga (>72 bytes)
print("7. Probando contraseña muy larga (>72 bytes)...")
try:
    long_password = "a" * 100  # 100 caracteres
    long_password_bytes = truncate_password(long_password)
    print(f"   Longitud original: 100 caracteres")
    print(f"   Longitud truncada: {len(long_password_bytes)} bytes")

    long_hashed = pwd_context.hash(long_password_bytes)
    is_valid = pwd_context.verify(long_password_bytes, long_hashed)

    if is_valid:
        print("   ✅ Contraseña larga manejada correctamente")
    else:
        print("   ❌ Falló con contraseña larga")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("="*50)
print("✅ TODOS LOS TESTS PASARON CORRECTAMENTE")
print("="*50)
print()
print("Bcrypt está funcionando correctamente.")
print("Puedes iniciar el servidor backend sin problemas.")
