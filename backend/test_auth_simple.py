# -*- coding: utf-8 -*-
"""Test simple de autenticacion con bcrypt"""

print("=" * 50)
print("Test de Autenticacion - Python 3.13")
print("=" * 50)
print()

# Test 1: Importar
print("1. Importando bcrypt...")
try:
    import bcrypt
    print("   [OK] bcrypt importado")
except ImportError as e:
    print(f"   [ERROR] {e}")
    exit(1)

print()

# Test 2: Generar hash
print("2. Generando hash de password...")
try:
    password = "MiPassword123!"
    password_bytes = password.encode('utf-8')[:72]  # Truncar a 72 bytes

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)

    print(f"   Password: {password}")
    print(f"   Hash: {hashed[:30].decode('utf-8')}...")
    print("   [OK] Hash generado")
except Exception as e:
    print(f"   [ERROR] {e}")
    exit(1)

print()

# Test 3: Verificar password correcta
print("3. Verificando password correcta...")
try:
    result = bcrypt.checkpw(password_bytes, hashed)
    if result:
        print("   [OK] Password verificada correctamente")
    else:
        print("   [ERROR] Verificacion fallo")
        exit(1)
except Exception as e:
    print(f"   [ERROR] {e}")
    exit(1)

print()

# Test 4: Verificar password incorrecta
print("4. Verificando password incorrecta...")
try:
    wrong_password = "PasswordIncorrecta".encode('utf-8')[:72]
    result = bcrypt.checkpw(wrong_password, hashed)
    if not result:
        print("   [OK] Rechazo password incorrecta")
    else:
        print("   [ERROR] Acepto password incorrecta")
        exit(1)
except Exception as e:
    print(f"   [ERROR] {e}")
    exit(1)

print()

# Test 5: Password larga (>72 bytes)
print("5. Probando password larga...")
try:
    long_password = ("a" * 100).encode('utf-8')[:72]
    long_salt = bcrypt.gensalt()
    long_hashed = bcrypt.hashpw(long_password, long_salt)

    result = bcrypt.checkpw(long_password, long_hashed)
    if result:
        print("   [OK] Password larga manejada correctamente")
    else:
        print("   [ERROR] Fallo con password larga")
        exit(1)
except Exception as e:
    print(f"   [ERROR] {e}")
    exit(1)

print()
print("=" * 50)
print("[OK] TODOS LOS TESTS PASARON")
print("=" * 50)
print()
print("El sistema de autenticacion funciona correctamente.")
print("Puedes iniciar el servidor backend.")
