# Solución de Problemas - Python 3.13

## Problemas Comunes con Python 3.13

Python 3.13 es una versión reciente y algunas librerías pueden tener problemas de compatibilidad.

### Problema 1: Error al instalar psycopg2-binary

**Error típico:**
```
error: Microsoft Visual C++ 14.0 or greater is required
```

**Solución 1 - Usar psycopg3:**
```bash
pip uninstall psycopg2-binary
pip install psycopg[binary]
```

Luego actualiza el código en `backend/app/database.py` si es necesario.

**Solución 2 - Instalar Build Tools:**
Si quieres usar psycopg2-binary:
1. Descarga e instala "Microsoft C++ Build Tools"
2. Luego ejecuta: `pip install psycopg2-binary`

**Solución 3 - Usar Docker:**
La forma más fácil es usar Docker, que tiene todas las dependencias pre-instaladas.

### Problema 2: Errores con bcrypt o cryptography

**Error típico:**
```
ERROR: Failed building wheel for bcrypt
```

**Solución 1 - Actualizar pip y setuptools:**
```bash
python -m pip install --upgrade pip setuptools wheel
pip install bcrypt
```

**Solución 2 - Instalar pre-built wheels:**
```bash
pip install --only-binary :all: bcrypt
```

### Problema 3: Error con python-jose

**Solución:**
```bash
pip install python-jose[cryptography] --no-cache-dir
```

### Instalación Recomendada para Python 3.13

**Paso 1:** Actualiza herramientas:
```bash
python -m pip install --upgrade pip setuptools wheel
```

**Paso 2:** Instala con el archivo alternativo:
```bash
cd backend
pip install -r requirements-py313.txt
```

**Paso 3:** Si aún hay problemas, instala individualmente:
```bash
# Instalar las más problemáticas primero
pip install --upgrade pip wheel setuptools
pip install bcrypt
pip install cryptography
pip install psycopg[binary]

# Luego el resto
pip install -r requirements-py313.txt
```

### Opción Alternativa: Usar Python 3.11

Si sigues teniendo problemas, la opción más estable es usar Python 3.11:

**Windows:**
1. Descarga Python 3.11 desde python.org
2. Instala en una carpeta separada (ej: C:\Python311)
3. Crea un virtual environment:
```bash
C:\Python311\python.exe -m venv venv311
venv311\Scripts\activate
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
# Instalar pyenv para gestionar versiones
curl https://pyenv.run | bash

# Instalar Python 3.11
pyenv install 3.11.7
pyenv local 3.11.7

# Crear virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Mejor Opción: Usar Docker

La forma más confiable de ejecutar el proyecto sin problemas de dependencias:

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Docker maneja todas las dependencias automáticamente y funciona igual en todos los sistemas operativos.

### Verificar la Instalación

Después de instalar, verifica que todo funcione:

```bash
cd backend
python -c "import fastapi; import sqlalchemy; import psycopg2; print('✓ Todas las librerías importadas correctamente')"
```

Si ves el mensaje de éxito, estás listo para iniciar el servidor:

```bash
uvicorn app.main:app --reload
```

### Versiones Probadas y Compatibles

- **Python 3.11.x**: ✅ Totalmente compatible
- **Python 3.12.x**: ✅ Compatible con versiones actualizadas
- **Python 3.13.x**: ⚠️ Compatible pero requiere versiones más recientes de las librerías

### Contacto para Soporte

Si ninguna solución funciona:
1. Verifica tu versión de Python: `python --version`
2. Crea un issue con el mensaje de error completo
3. Incluye tu sistema operativo y versión de Python
