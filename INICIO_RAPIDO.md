# Guía de Inicio Rápido - Plataforma Educativa

## Pasos para comenzar

### 1. Configurar Variables de Entorno

#### Backend
Crea el archivo `.env` en la carpeta `backend`:

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus configuraciones:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/plataforma_educativa
SECRET_KEY=tu-clave-secreta-super-segura-cambiala-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# APIs de IA (opcionales)
OPENAI_API_KEY=tu-api-key-de-openai
GEMINI_API_KEY=tu-api-key-de-gemini
OLLAMA_BASE_URL=http://localhost:11434

INITIAL_CREDITS=500
```

#### Frontend
Crea el archivo `.env` en la carpeta `frontend`:

```bash
cd frontend
cp .env.example .env
```

### 2. Opción A: Usar Docker (Más fácil)

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432
- Backend en http://localhost:8000
- Frontend en http://localhost:3000

### 3. Opción B: Instalación Manual

#### Paso 1: Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb plataforma_educativa
```

#### Paso 2: Backend
```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn app.main:app --reload
```

El backend estará en: http://localhost:8000
Documentación API: http://localhost:8000/docs

#### Paso 3: Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en: http://localhost:3000

### 4. Verificar que Ollama está funcionando

Si quieres usar modelos de IA locales (gratis):

1. Asegúrate de que Ollama esté instalado e iniciado
2. Verifica que está corriendo:
```bash
curl http://localhost:11434/api/version
```

3. Lista de modelos que tienes disponibles:
```bash
ollama list
```

Tus modelos disponibles:
- qwen3-embedding:0.6b
- qwen2.5vl:latest
- qwen3:4b
- embeddinggemma:latest
- deepseek-r1:8b
- llama2:7b-chat

### 5. Primer Uso

1. Abre http://localhost:3000
2. Haz clic en "Regístrate"
3. Completa el formulario:
   - Email
   - Usuario
   - Contraseña
   - Rol (Docente o Estudiante)
4. Recibirás 500 créditos automáticamente
5. Comienza a crear contenido educativo

### 6. Crear tu Primera Actividad

1. Desde el dashboard, selecciona un tipo de contenido (ej: Exámenes)
2. Completa el formulario
3. **IMPORTANTE**: Selecciona "Ollama" como proveedor para no gastar créditos
4. Selecciona uno de tus modelos disponibles (ej: qwen2.5vl:latest)
5. Genera el contenido
6. Exporta a Word o Excel si lo necesitas

### 7. Estructura de Créditos

- **Ollama**: ¡GRATIS! No consume créditos
- **OpenAI**: Consume créditos (aprox. 1 crédito por cada 100 tokens)
- **Gemini**: Consume créditos (aprox. 5 créditos por generación)

### 8. Compartir Actividades

Al crear una actividad puedes elegir:
- **Pública**: Otros docentes pueden verla y usarla
- **Privada**: Solo tú puedes verla

### 9. Exportar Contenido

Formatos disponibles:
- **Word (.docx)**: Para exámenes, resúmenes, actividades, rúbricas, correos, etc.
- **Excel (.xlsx)**: Para exámenes, encuestas, rúbricas, crucigramas, sopas de letras

## Tipos de Contenido Disponibles

### Herramientas Educativas
1. **Exámenes**: Con preguntas V/F, selección múltiple y respuesta corta
2. **Resúmenes**: De textos largos o documentos
3. **Actividades de Clase**: Planificación completa de actividades
4. **Rúbricas**: Evaluación personalizada por tema y nivel
5. **Corrección de Escritura**: Ortografía, gramática y sintaxis
6. **Diapositivas**: Contenido para presentaciones
7. **Correos**: Plantillas profesionales
8. **Encuestas**: Personalizadas por tema

### Juegos Educativos
1. **Cuentos/Fábulas/Aventuras**: Historias personalizadas con personajes
2. **Crucigramas**: Temáticos y educativos
3. **Sopas de Letras**: Por tema y dificultad

## Solución de Problemas

### El backend no inicia
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Asegúrate de haber instalado todas las dependencias

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en el puerto 8000
- Revisa la variable `NEXT_PUBLIC_API_URL` en `frontend/.env`

### Ollama no funciona
- Verifica que Ollama esté instalado e iniciado
- Prueba: `curl http://localhost:11434/api/version`
- Si usas Docker, asegúrate de que `OLLAMA_BASE_URL` apunte a `host.docker.internal:11434`

### Error de créditos insuficientes
- Usa Ollama en lugar de OpenAI/Gemini (es gratis)
- O contacta al administrador para obtener más créditos

## Próximos Pasos

1. Explora todas las herramientas disponibles
2. Crea tus primeras actividades
3. Comparte contenido con otros docentes
4. Exporta a Word/Excel
5. Personaliza los prompts para mejores resultados

## Soporte

Si tienes problemas:
1. Revisa la documentación completa en README.md
2. Consulta los logs del backend y frontend
3. Verifica la documentación de la API en http://localhost:8000/docs
4. Abre un issue en el repositorio

¡Disfruta creando contenido educativo con IA!
