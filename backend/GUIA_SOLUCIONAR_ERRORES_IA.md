# Guía para Solucionar Errores de IA

## Error de OpenAI: "openai.ChatCompletion no está soportado en openai>=1.0.0"

### Problema
OpenAI cambió completamente su API en la versión 1.0.0. El código antiguo ya no funciona.

### Solución
He actualizado el código para usar la nueva API de OpenAI. Ahora necesitas:

1. **Instalar o actualizar OpenAI**:
```bash
pip install openai>=1.0.0
```

O si ya lo tenías instalado:
```bash
pip install --upgrade openai
```

2. **Configurar tu API Key** (si aún no lo hiciste):
   - Crea o edita el archivo `.env` en la carpeta `backend/`
   - Agrega tu API key de OpenAI:
```
OPENAI_API_KEY=tu-api-key-aqui
```

3. **Reiniciar el servidor**:
```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
uvicorn app.main:app --reload
```

### Verificar que funciona
Intenta generar contenido desde el frontend usando OpenAI. Deberías ver el contenido generado correctamente.

---

## Error de Ollama: "Error al comunicarse con Ollama: "

### Problema
Ollama no está corriendo o no se puede conectar.

### Diagnóstico Rápido
He creado un script de prueba para verificar si Ollama está funcionando:

```bash
cd backend
python test_ollama.py
```

Este script te dirá:
- Si Ollama está corriendo
- Qué modelos tienes instalados
- Si puede generar texto correctamente

### Soluciones Comunes

#### 1. Ollama no está corriendo
**Síntoma**: Error "No se puede conectar a Ollama en http://localhost:11434"

**Solución**:
```bash
# En Windows (cmd o PowerShell):
ollama serve

# Déjalo corriendo en esta terminal
# Abre otra terminal para ejecutar el backend
```

#### 2. Modelo no descargado
**Síntoma**: Error 404 o "modelo no encontrado"

**Solución**:
```bash
# Descarga el modelo que quieres usar
ollama pull qwen2.5vl:latest

# O cualquier otro modelo que tengas:
ollama pull llama2:7b-chat
ollama pull qwen3:4b
```

#### 3. Ollama no está instalado
**Síntoma**: Comando "ollama" no encontrado

**Solución**:
1. Descarga Ollama desde: https://ollama.ai
2. Instálalo
3. Reinicia tu terminal
4. Ejecuta `ollama serve`

#### 4. Timeout (demora mucho)
**Síntoma**: "Timeout después de 120 segundos"

**Soluciones**:
- El modelo puede ser muy grande para tu computadora
- Prueba con un modelo más pequeño: `ollama pull qwen3:4b`
- La primera vez que usas un modelo, puede tardar más
- Asegúrate de tener suficiente RAM

#### 5. Puerto 11434 ocupado
**Síntoma**: "Address already in use"

**Solución**:
```bash
# En Windows (PowerShell como administrador):
netstat -ano | findstr :11434
# Encuentra el PID del proceso
taskkill /PID [número_de_pid] /F

# Luego inicia Ollama de nuevo:
ollama serve
```

---

## Flujo de Trabajo Recomendado

### Para desarrollo con SOLO Ollama (gratis, sin créditos):

1. **Terminal 1 - Ollama**:
```bash
ollama serve
```

2. **Terminal 2 - Backend**:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

3. **Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
```

4. En el navegador:
   - Ve a http://localhost:3000
   - Crea contenido seleccionando **Ollama** como proveedor
   - No gastará créditos

### Para desarrollo con OpenAI o Gemini (usa créditos):

1. **Configura el archivo .env**:
```env
# backend/.env
OPENAI_API_KEY=tu-api-key-aqui
GEMINI_API_KEY=tu-api-key-aqui
```

2. **Instala las dependencias opcionales**:
```bash
# Para OpenAI:
pip install openai>=1.0.0

# Para Gemini:
pip install google-generativeai
```

3. **Reinicia el backend**

4. En el frontend, selecciona OpenAI o Gemini como proveedor

---

## Verificación Completa del Sistema

Ejecuta estos comandos uno por uno para verificar todo:

```bash
# 1. Verificar Ollama
python backend/test_ollama.py

# 2. Verificar que el backend inicia
cd backend
python -m uvicorn app.main:app --reload
# Deberías ver: "Application startup complete."

# 3. Verificar el frontend
cd frontend
npm run dev
# Deberías ver: "Local: http://localhost:3000"

# 4. Abre http://localhost:3000 y prueba crear un examen con Ollama
```

---

## Errores Específicos y Soluciones

### "Error: connect ECONNREFUSED 127.0.0.1:11434"
- Ollama no está corriendo
- Ejecuta `ollama serve` en otra terminal

### "Error: model 'qwen2.5vl:latest' not found"
- Descarga el modelo: `ollama pull qwen2.5vl:latest`

### "Error: OpenAI API key no configurada"
- Crea el archivo `backend/.env`
- Agrega: `OPENAI_API_KEY=tu-api-key`

### "Error: You exceeded your current quota"
- Tu cuenta de OpenAI no tiene créditos
- Usa Ollama (gratis) o agrega créditos a tu cuenta OpenAI

### "Error: CORS policy"
- El backend no está corriendo
- Verifica que esté en http://localhost:8000

---

## Contacto de Soporte

Si sigues teniendo problemas:

1. Ejecuta `python backend/test_ollama.py` y comparte el resultado
2. Comparte los logs del backend (terminal donde ejecutas uvicorn)
3. Comparte el error específico que ves en el frontend
