# Rutas del Frontend - Plataforma Educativa

## Rutas Públicas (sin autenticación)

- **/** - Página inicial (redirige a /dashboard si está autenticado, sino a /login)
- **/login** - Iniciar sesión
- **/register** - Crear cuenta nueva

## Rutas Privadas (requieren autenticación)

### Dashboard y Navegación

- **/dashboard** - Panel principal con todas las herramientas
- **/activities** - Lista de todas tus actividades creadas

### Crear Contenido Educativo

Todas estas rutas están en desarrollo. Muestran una página temporal explicando que la funcionalidad está en desarrollo:

- **/create/exam** - Crear examen
- **/create/summary** - Crear resumen
- **/create/class_activity** - Crear actividad de clase
- **/create/rubric** - Crear rúbrica
- **/create/writing_correction** - Corrección de escritura
- **/create/slides** - Crear diapositivas
- **/create/email** - Crear correo electrónico
- **/create/survey** - Crear encuesta

### Crear Juegos Educativos

También en desarrollo:

- **/create/story** - Crear cuento/fábula/aventura
- **/create/crossword** - Crear crucigrama
- **/create/word_search** - Crear sopa de letras

### Ver Actividad

- **/activity/[id]** - Ver detalles de una actividad específica
  - Ejemplo: `/activity/1`, `/activity/2`, etc.
  - Permite exportar a Word/Excel
  - Permite cambiar visibilidad (público/privado)

## Estructura de Navegación

```
/ (home)
├── /login
├── /register
└── /dashboard (requiere auth)
    ├── /activities
    │   └── /activity/[id]
    └── /create/[type]
        ├── /create/exam
        ├── /create/summary
        ├── /create/class_activity
        ├── /create/rubric
        ├── /create/writing_correction
        ├── /create/slides
        ├── /create/email
        ├── /create/survey
        ├── /create/story
        ├── /create/crossword
        └── /create/word_search
```

## Estado Actual

✅ **Funcionando:**
- Registro de usuarios
- Inicio de sesión
- Dashboard principal
- Lista de actividades
- Vista de detalle de actividad
- Exportación a Word/Excel (backend implementado)

⚠️ **En Desarrollo:**
- Formularios de creación de contenido
- Los endpoints de la API están listos en `/api/content/*`
- Puedes probar la API en http://localhost:8000/docs

## Próximos Pasos para Desarrolladores

Para completar las páginas de creación, necesitas crear formularios en las rutas `/create/[type]` que:

1. Recojan los datos del usuario según el tipo de actividad
2. Llamen a los endpoints correspondientes en `contentAPI`
3. Redirijan a la vista de la actividad creada

Ejemplo para crear un examen:
```typescript
// En /create/exam/page.tsx
const handleSubmit = async (data) => {
  const activity = await contentAPI.generateExam({
    topic: data.topic,
    num_questions: data.numQuestions,
    question_types: data.questionTypes,
    ai_provider: 'ollama',
    model_name: 'qwen2.5vl:latest'
  });

  router.push(`/activity/${activity.id}`);
};
```

## Navegación Rápida

Desde el dashboard puedes:
- Hacer clic en cualquier tarjeta de herramienta → Ir a `/create/[type]`
- Hacer clic en "Ver todas" en actividades → Ir a `/activities`
- Ver actividades recientes y hacer clic en "Ver" → Ir a `/activity/[id]`

## URLs Importantes

- Frontend: http://localhost:3000
- API Backend: http://localhost:8000
- Documentación API: http://localhost:8000/docs
