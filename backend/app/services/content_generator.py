from typing import Dict, Any, List
from .ai_service import ai_service
from ..models.activity import AIProvider
import json


class ContentGenerator:
    """
    Servicio para generar diferentes tipos de contenido educativo
    """

    async def generate_exam(
        self,
        topic: str,
        num_questions: int,
        question_types: List[str],
        grade_level: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera un examen con diferentes tipos de preguntas
        """
        prompt = f"""
Crea un examen sobre el tema: {topic}
Nivel académico: {grade_level}
Número de preguntas: {num_questions}
Tipos de preguntas a incluir: {', '.join(question_types)}

Genera el examen en formato JSON con la siguiente estructura:
{{
    "title": "Título del examen",
    "instructions": "Instrucciones para los estudiantes",
    "questions": [
        {{
            "id": 1,
            "type": "multiple_choice" o "true_false" o "short_answer",
            "question": "Texto de la pregunta",
            "options": ["Opción A", "Opción B", "Opción C", "Opción D"] (solo para multiple_choice),
            "correct_answer": "Respuesta correcta",
            "points": 1
        }}
    ],
    "total_points": 10
}}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_summary(
        self,
        text: str,
        length: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera un resumen de un texto
        """
        length_instructions = {
            "short": "un resumen breve de 2-3 párrafos",
            "medium": "un resumen moderado de 4-5 párrafos",
            "long": "un resumen detallado de 6-8 párrafos"
        }

        prompt = f"""
Por favor, crea {length_instructions.get(length, length_instructions['medium'])} del siguiente texto:

{text}

Presenta el resumen en formato JSON:
{{
    "summary": "El texto del resumen aquí",
    "key_points": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
    "word_count": número de palabras del resumen
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_class_activity(
        self,
        topic: str,
        duration_minutes: int,
        grade_level: str,
        objectives: List[str],
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera una actividad de clase
        """
        prompt = f"""
Diseña una actividad de clase con las siguientes características:
- Tema: {topic}
- Duración: {duration_minutes} minutos
- Nivel: {grade_level}
- Objetivos de aprendizaje: {', '.join(objectives)}

Estructura la actividad en formato JSON:
{{
    "title": "Título de la actividad",
    "objectives": ["Objetivo 1", "Objetivo 2"],
    "materials": ["Material 1", "Material 2"],
    "steps": [
        {{
            "step": 1,
            "description": "Descripción del paso",
            "duration_minutes": 10
        }}
    ],
    "assessment": "Cómo evaluar la actividad",
    "extensions": "Actividades de extensión o adaptaciones"
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_rubric(
        self,
        topic: str,
        career: str,
        semester: str,
        objectives: List[str],
        criteria: List[str],
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera una rúbrica de evaluación
        """
        prompt = f"""
Crea una rúbrica de evaluación para:
- Tema: {topic}
- Carrera: {career}
- Semestre: {semester}
- Objetivos: {', '.join(objectives)}
- Criterios a evaluar: {', '.join(criteria)}

Formato JSON:
{{
    "title": "Título de la rúbrica",
    "criteria": [
        {{
            "name": "Criterio 1",
            "weight": 25,
            "levels": [
                {{
                    "level": "Excelente",
                    "points": 4,
                    "description": "Descripción del nivel excelente"
                }},
                {{
                    "level": "Bueno",
                    "points": 3,
                    "description": "Descripción del nivel bueno"
                }},
                {{
                    "level": "Suficiente",
                    "points": 2,
                    "description": "Descripción del nivel suficiente"
                }},
                {{
                    "level": "Insuficiente",
                    "points": 1,
                    "description": "Descripción del nivel insuficiente"
                }}
            ]
        }}
    ],
    "total_points": 100
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def correct_writing(
        self,
        text: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Corrige un texto (ortografía, gramática, sintaxis)
        """
        prompt = f"""
Analiza y corrige el siguiente texto, identificando errores de ortografía, gramática, sintaxis y estilo:

{text}

Proporciona la corrección en formato JSON:
{{
    "original_text": "El texto original",
    "corrected_text": "El texto corregido",
    "errors": [
        {{
            "type": "ortografía" o "gramática" o "sintaxis" o "estilo",
            "original": "texto con error",
            "correction": "texto corregido",
            "explanation": "Explicación del error"
        }}
    ],
    "suggestions": ["Sugerencia de mejora 1", "Sugerencia 2"]
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_slides(
        self,
        topic: str,
        num_slides: int,
        grade_level: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera contenido para diapositivas
        """
        prompt = f"""
Crea el contenido para una presentación de {num_slides} diapositivas sobre: {topic}
Nivel académico: {grade_level}

Formato JSON:
{{
    "title": "Título de la presentación",
    "slides": [
        {{
            "slide_number": 1,
            "title": "Título de la diapositiva",
            "content": ["Punto 1", "Punto 2", "Punto 3"],
            "notes": "Notas para el presentador"
        }}
    ]
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_email(
        self,
        purpose: str,
        recipient_type: str,
        tone: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera texto para un correo electrónico
        """
        prompt = f"""
Redacta un correo electrónico con las siguientes características:
- Propósito: {purpose}
- Destinatario: {recipient_type}
- Tono: {tone}

Formato JSON:
{{
    "subject": "Asunto del correo",
    "body": "Cuerpo del correo",
    "closing": "Despedida apropiada"
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_survey(
        self,
        topic: str,
        num_questions: int,
        question_types: List[str],
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera una encuesta
        """
        prompt = f"""
Crea una encuesta sobre: {topic}
Número de preguntas: {num_questions}
Tipos de preguntas: {', '.join(question_types)}

Formato JSON:
{{
    "title": "Título de la encuesta",
    "description": "Descripción y propósito",
    "questions": [
        {{
            "id": 1,
            "type": "multiple_choice" o "scale" o "open",
            "question": "Texto de la pregunta",
            "options": ["Opción 1", "Opción 2"] (si aplica),
            "scale": {{"min": 1, "max": 5}} (si es tipo scale)
        }}
    ]
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_story(
        self,
        theme: str,
        story_type: str,
        characters: List[str],
        moral: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera un cuento, fábula o aventura personalizada
        """
        prompt = f"""
Crea un {story_type} con las siguientes características:
- Tema: {theme}
- Personajes: {', '.join(characters)}
- Moraleja (si aplica): {moral or 'Sin moraleja específica'}

Formato JSON:
{{
    "title": "Título de la historia",
    "type": "{story_type}",
    "story": "El texto completo de la historia, dividido en párrafos",
    "characters": {characters},
    "moral": "La moraleja o enseñanza",
    "discussion_questions": ["Pregunta 1", "Pregunta 2", "Pregunta 3"]
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    async def generate_crossword(
        self,
        topic: str,
        num_words: int,
        difficulty: str,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera un crucigrama
        """
        prompt = f"""
Crea un crucigrama sobre: {topic}
Número de palabras: {num_words}
Dificultad: {difficulty}

Formato JSON:
{{
    "title": "Título del crucigrama",
    "clues": {{
        "across": [
            {{
                "number": 1,
                "clue": "Pista horizontal",
                "answer": "RESPUESTA",
                "position": {{"row": 0, "col": 0}}
            }}
        ],
        "down": [
            {{
                "number": 2,
                "clue": "Pista vertical",
                "answer": "RESPUESTA",
                "position": {{"row": 0, "col": 0}}
            }}
        ]
    }},
    "grid_size": {{"rows": 15, "cols": 15}}
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return self._normalize_result(result)

    def _normalize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """If the provider returned content as a JSON string, parse it into a dict.

        Returns the same dict but with `content` converted to a Python object when possible.
        """
        content = result.get("content")
        if isinstance(content, str):
            try:
                parsed = json.loads(content)
                result["content"] = parsed
            except Exception:
                # keep original string if parsing fails (some endpoints return plain text)
                result["content"] = content
        return result

    async def generate_word_search(
        self,
        topic: str,
        num_words: int,
        grid_size: int,
        provider: AIProvider,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Genera una sopa de letras
        """
        prompt = f"""
Crea una sopa de letras sobre: {topic}
Número de palabras a incluir: {num_words}
Tamaño de la cuadrícula: {grid_size}x{grid_size}

Formato JSON:
{{
    "title": "Título de la sopa de letras",
    "words": [
        {{
            "word": "PALABRA",
            "hint": "Pista para encontrar la palabra"
        }}
    ],
    "grid": [
        ["A", "B", "C", ...],
        ["D", "E", "F", ...],
        ...
    ]
}}

IMPORTANTE: Responde SOLO con el JSON.
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name
        )

        return result


content_generator = ContentGenerator()
