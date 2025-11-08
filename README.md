# Plataforma Educativa con IA

Plataforma web educativa que utiliza modelos de IA (Ollama, OpenAI, Gemini) para generar contenido educativo automáticamente.

## Características

### Autenticación y Roles
- Sistema de usuarios con tres roles: Admin, Docente y Estudiante
- Cada usuario inicia con 500 créditos
- Sistema de autenticación JWT

### Generación de Contenido Educativo
1. **Exámenes**: Genera exámenes con preguntas de V/F, selección múltiple y respuesta corta
2. **Resúmenes**: Crea resúmenes a partir de textos largos o documentos
3. **Actividades de Clase**: Diseña actividades de clase completas
4. **Rúbricas de Evaluación**: Genera rúbricas personalizadas por tema, carrera y semestre
5. **Corrección de Escritura**: Corrige ortografía, gramática y sintaxis
6. **Diapositivas**: Genera contenido para presentaciones
7. **Correos Electrónicos**: Crea plantillas de correo profesional
8. **Encuestas**: Diseña encuestas personalizadas
9. **Chatbots**: Chatbots especializados por área

### Juegos Educativos
1. **Cuentos/Fábulas/Aventuras**: Genera historias personalizadas
2. **Crucigramas**: Crea crucigramas temáticos
3. **Sopas de Letras**: Genera sopas de letras educativas

### Funcionalidades Adicionales
- Sistema de créditos (se descuenta solo con APIs de pago, Ollama es gratis)
- Exportación a Word y Excel
- Actividades públicas y privadas
- Historial de actividades compartido entre docentes

## Tecnologías

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Python 3.11+
- Integración con Ollama, OpenAI y Gemini

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)

## Instalación

### Prerequisitos
- Python 3.11+ (3.13 soportado - ver guía específica)
- Node.js 18+
- PostgreSQL 15+
- Ollama (opcional, para modelos locales)
- Docker y Docker Compose (opcional)

### Nota para Python 3.13
Si tienes Python 3.13, consulta la guía específica: [INICIO_PYTHON313.md](INICIO_PYTHON313.md)

Instalación rápida para Python 3.13:
```bash
scripts\setup-py313.bat  # Windows
# o
./scripts/setup-py313.sh  # Linux/Mac
```

### Opción 1: Docker (Recomendado)

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd plataforma-educativa
```

2. Configurar variables de entorno:
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Frontend
cp frontend/.env.example frontend/.env
```

3. Iniciar con Docker Compose:
```bash
docker-compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### Opción 2: Instalación Manual

#### Backend

1. Crear base de datos PostgreSQL:
```bash
createdb plataforma_educativa
```

2. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Ejecutar migraciones:
```bash
alembic upgrade head
```

5. Iniciar servidor:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

## Configuración de Ollama

Para usar modelos de IA locales sin costo:

1. Instalar Ollama: https://ollama.ai

2. Descargar modelos (puedes usar los que ya tienes):
```bash
ollama pull qwen2.5vl:latest
ollama pull llama2:7b-chat
```

3. Ollama debe estar corriendo en http://localhost:11434

## Uso

### Primer Usuario (Admin)

1. Registrarse en http://localhost:3000/register
2. Seleccionar rol "Docente" o crear un admin directamente en la base de datos

### Crear Contenido

1. Iniciar sesión
2. Desde el dashboard, seleccionar el tipo de contenido a generar
3. Completar el formulario
4. Elegir proveedor de IA (Ollama gratis, o OpenAI/Gemini con créditos)
5. Generar contenido
6. Exportar a Word o Excel según el tipo de contenido

### Compartir Actividades

Al crear una actividad, puedes marcarla como:
- **Pública**: Visible para todos los docentes
- **Privada**: Solo visible para ti

## API Endpoints

### Autenticación
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión
- GET `/api/auth/me` - Obtener usuario actual
- GET `/api/auth/credits` - Obtener créditos y transacciones

### Actividades
- GET `/api/activities/` - Listar actividades
- GET `/api/activities/{id}` - Obtener actividad
- GET `/api/activities/my/activities` - Mis actividades
- PATCH `/api/activities/{id}` - Actualizar actividad
- DELETE `/api/activities/{id}` - Eliminar actividad

### Generación de Contenido
- POST `/api/content/exam` - Generar examen
- POST `/api/content/summary` - Generar resumen
- POST `/api/content/class-activity` - Generar actividad de clase
- POST `/api/content/rubric` - Generar rúbrica
- POST `/api/content/writing-correction` - Corregir escritura
- POST `/api/content/slides` - Generar diapositivas
- POST `/api/content/email` - Generar correo
- POST `/api/content/survey` - Generar encuesta
- POST `/api/content/story` - Generar cuento
- POST `/api/content/crossword` - Generar crucigrama
- POST `/api/content/word-search` - Generar sopa de letras

### Exportación
- GET `/api/export/{id}/word` - Exportar a Word
- GET `/api/export/{id}/excel` - Exportar a Excel

## Estructura del Proyecto

```
plataforma-educativa/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos de base de datos
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── routers/         # Endpoints API
│   │   ├── services/        # Lógica de negocio
│   │   ├── utils/           # Utilidades
│   │   ├── config.py        # Configuración
│   │   ├── database.py      # Conexión DB
│   │   └── main.py          # App principal
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/            # Páginas Next.js
│   │   ├── components/     # Componentes React
│   │   ├── lib/            # Utilidades y API
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT

## Soporte

Para preguntas y soporte, abre un issue en el repositorio.
