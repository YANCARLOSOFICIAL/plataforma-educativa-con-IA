# Inicio Rápido - Python 3.13

Esta guía es específica para Python 3.13. Si tienes problemas, consulta `SOLUCION_PROBLEMAS_PY313.md`.

## Paso 1: Verificar Python

```bash
python --version
```

Deberías ver: `Python 3.13.x`

## Paso 2: Actualizar herramientas

```bash
python -m pip install --upgrade pip setuptools wheel
```

## Paso 3: Instalar dependencias (Opción A - Solo Ollama)

Si SOLO vas a usar Ollama (modelos locales, gratis), usa esta instalación mínima:

```bash
cd backend
pip install -r requirements-minimal.txt
```

Esto instala todo lo necesario EXCEPTO OpenAI y Gemini. El proyecto funcionará perfectamente con solo Ollama.

## Paso 4: Instalar dependencias (Opción B - Con OpenAI/Gemini)

Si también quieres usar OpenAI o Gemini, instala después de la opción A:

```bash
# Para OpenAI
pip install openai

# Para Gemini
pip install google-generativeai
```

## Paso 5: Configurar Base de Datos

### Opción A: PostgreSQL local

```bash
# Crear base de datos
createdb plataforma_educativa
```

### Opción B: Docker solo para PostgreSQL

```bash
docker run --name plataforma_educativa_db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=plataforma_educativa \
  -p 5432:5432 \
  -d postgres:15-alpine
```

## Paso 6: Configurar variables de entorno

Crea `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/plataforma_educativa
SECRET_KEY=cambia-esto-por-una-clave-segura-aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Ollama (debe estar corriendo en tu PC)
OLLAMA_BASE_URL=http://localhost:11434

# APIs de IA (opcional, solo si instalaste las librerías)
# OPENAI_API_KEY=tu-api-key
# GEMINI_API_KEY=tu-api-key

INITIAL_CREDITS=500
```

## Paso 7: Verificar que Ollama está corriendo

```bash
curl http://localhost:11434/api/version
```

Si no responde:
- Abre Ollama
- O ejecuta: `ollama serve`

Verifica tus modelos:
```bash
ollama list
```

## Paso 8: Iniciar el backend

```bash
cd backend
uvicorn app.main:app --reload
```

Deberías ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Prueba: http://localhost:8000/docs

## Paso 9: Instalar frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev
```

Deberías ver:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Paso 10: Probar la aplicación

1. Abre http://localhost:3000
2. Regístrate con tu email
3. Recibirás 500 créditos
4. Crea tu primer contenido usando **Ollama** (gratis)

## Modelos Ollama Recomendados para Educación

Tus modelos disponibles:
- **qwen2.5vl:latest** - Excelente para español, multimodal
- **deepseek-r1:8b** - Bueno para razonamiento y explicaciones
- **llama2:7b-chat** - Clásico para conversación
- **qwen3:4b** - Rápido y eficiente

## Solución de Problemas Comunes

### Error: "No module named 'fastapi'"

```bash
cd backend
pip install -r requirements-minimal.txt
```

### Error: "No module named 'openai'" o "google.generativeai"

Esto es normal si solo instalaste requirements-minimal.txt. Simplemente:
- Usa **Ollama** en la interfaz (es gratis)
- O instala las librerías opcionales si las necesitas

### Error: "psycopg2" no se puede instalar

```bash
pip install psycopg[binary]
```

Luego actualiza `backend/app/database.py` si es necesario.

### Error: Cannot connect to database

Verifica que PostgreSQL esté corriendo:
```bash
# Windows
pg_ctl status

# Linux/Mac
sudo systemctl status postgresql
```

O usa Docker:
```bash
docker ps | grep postgres
```

### Error: Cannot connect to Ollama

Verifica que Ollama esté corriendo:
```bash
curl http://localhost:11434/api/version
```

Si no:
```bash
ollama serve
```

## Verificar que todo funciona

```bash
# Test backend
curl http://localhost:8000/health

# Debería responder: {"status":"healthy"}
```

## Próximos Pasos

1. Crea tu primer examen usando Ollama
2. Exporta a Word
3. Comparte actividades con otros docentes
4. Explora todas las herramientas

## Ventajas de usar solo Ollama

- ✅ Completamente GRATIS (no gasta créditos)
- ✅ Privacidad total (todo local)
- ✅ Sin límites de uso
- ✅ Funciona sin internet (una vez descargados los modelos)
- ✅ Modelos en español muy buenos (qwen2.5vl)

## Scripts de ayuda

### Windows
```bash
# Configuración inicial
scripts\setup.bat

# Iniciar todo
scripts\start.bat
```

### Linux/Mac
```bash
# Configuración inicial
./scripts/setup.sh

# Iniciar todo
./scripts/start.sh
```

## URLs importantes

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Ollama: http://localhost:11434

¡Listo! Ya puedes crear contenido educativo con IA de forma gratuita usando tus modelos de Ollama.
