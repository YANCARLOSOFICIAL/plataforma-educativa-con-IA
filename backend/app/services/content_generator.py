from typing import Dict, Any, List, Optional
from .ai_service import ai_service
from ..models.activity import AIProvider
from sqlalchemy.orm import Session
import json


JSON_FORMAT_INSTRUCTIONS = """
FORMATO DE RESPUESTA:
- Responde ÚNICAMENTE con JSON válido
- NO incluyas texto adicional antes o después del JSON
- NO uses comillas simples ('), usa comillas dobles (")
- NO incluyas comas al final del último elemento
- Asegúrate de cerrar todas las llaves y corchetes
- NO incluyas comentarios en el JSON
"""


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
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        question_distribution: Optional[Dict[str, int]] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Genera un examen con diferentes tipos de preguntas
        """
        # Si hay distribución específica, usarla; sino, distribuir equitativamente
        if question_distribution:
            distribution_text = "\n".join([
                f"- {question_distribution.get(qtype, 0)} preguntas de tipo '{qtype}'"
                for qtype in question_types
            ])
            distribution_info = f"\nDistribución específica de preguntas:\n{distribution_text}"
        else:
            distribution_info = f"\nDistribuir las {num_questions} preguntas equitativamente entre los tipos: {', '.join(question_types)}"

        prompt = f"""
Crea un examen sobre el tema: {topic}
Nivel académico: {grade_level}
Número total de preguntas: {num_questions}
{distribution_info}

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
    "total_points": {num_questions}
}}

IMPORTANTE:
- Respeta EXACTAMENTE la distribución de preguntas solicitada.
- El total de preguntas DEBE ser exactamente {num_questions}.

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_summary(
        self,
        text: str,
        length: str,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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
Crea {length_instructions.get(length, length_instructions['medium'])} del siguiente texto.

INSTRUCCIONES IMPORTANTES:
1. El resumen DEBE estar escrito en ESPAÑOL, independientemente del idioma del texto original.
2. Escribe de forma DIRECTA sobre el contenido, NO uses frases como "el documento describe", "el texto habla de", "este proyecto trata sobre", etc.
3. Presenta la información de manera clara y amena, como si estuvieras explicando el tema a alguien.
4. Enfócate en el CONTENIDO y las IDEAS principales, no en describir el documento.
5. Usa un tono natural y accesible.

Texto a resumir:

{text}

Presenta el resumen en formato JSON:
{{
    "summary": "Resumen directo del contenido en español, sin mencionar que es un documento o texto",
    "key_points": ["Idea principal 1", "Idea principal 2", "Idea principal 3"],
    "word_count": número de palabras del resumen
}}

Todo en ESPAÑOL.
{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_class_activity(
        self,
        topic: str,
        duration_minutes: int,
        grade_level: str,
        objectives: List[str],
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_rubric(
        self,
        topic: str,
        faculty: str,
        career: str,
        semester: str,
        objectives: List[str],
        criteria: List[str],
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Genera una rúbrica de evaluación
        """
        prompt = f"""
Crea una rúbrica de evaluación para:
- Tema: {topic}
- Facultad: {faculty}
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def correct_writing(
        self,
        text: str,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_slides(
        self,
        topic: str,
        num_slides: int,
        grade_level: str,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Genera contenido para diapositivas con imágenes relevantes
        """
        prompt = f"""
Crea el contenido para una presentación de {num_slides} diapositivas sobre: {topic}
Nivel académico: {grade_level}

IMPORTANTE: Para cada diapositiva, proporciona una búsqueda de imagen relevante en inglés que represente visualmente el contenido.

Formato JSON:
{{
    "title": "Título de la presentación",
    "slides": [
        {{
            "slide_number": 1,
            "title": "Título de la diapositiva",
            "content": ["Punto 1", "Punto 2", "Punto 3"],
            "notes": "Notas para el presentador",
            "image_search": "término de búsqueda en inglés para encontrar imagen relevante",
            "design_style": "modern" o "minimal" o "colorful" o "professional"
        }}
    ]
}}

INSTRUCCIONES PARA image_search:
- Debe ser un término simple y específico en INGLÉS
- Describe lo que se debe ver en la imagen (ej: "renewable energy solar panels", "ancient rome colosseum", "marketing strategy meeting")
- Evita términos muy genéricos, sé específico al tema de la diapositiva

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        normalized_result = self._normalize_result(result)

        # Buscar imágenes para cada diapositiva
        try:
            from .image_search_service import image_search_service

            content = normalized_result.get("content", {})
            slides = content.get("slides", [])

            # Buscar imágenes para cada diapositiva
            for slide in slides:
                image_search = slide.get("image_search", "")
                if image_search:
                    image_data = await image_search_service.search_image(
                        query=image_search,
                        orientation="landscape"
                    )
                    if image_data:
                        slide["image"] = image_data

            normalized_result["content"] = content

        except Exception as e:
            print(f"Error buscando imágenes para diapositivas: {e}")
            # Continuar sin imágenes si hay error

        return normalized_result

    async def generate_email(
        self,
        purpose: str,
        recipient_type: str,
        tone: str,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_survey(
        self,
        topic: str,
        num_questions: int,
        question_types: List[str],
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_story(
        self,
        theme: str,
        story_type: str,
        characters: List[str],
        moral: str,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    async def generate_crossword(
        self,
        topic: str,
        num_words: int,
        difficulty: str,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Genera un crucigrama
        """
        difficulty_instructions = {
            "easy": "Palabras de 4-7 letras con pistas muy directas y definiciones simples",
            "medium": "Palabras de 5-9 letras con pistas descriptivas claras",
            "hard": "Palabras de 6-12 letras con pistas más elaboradas"
        }

        prompt = f"""
Crea un crucigrama educativo sobre el tema: {topic}
Número total de palabras: {num_words}
Dificultad: {difficulty} - {difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}

INSTRUCCIONES IMPORTANTES:
1. Cada pista debe ser CLARA y ESPECÍFICA - usa definiciones directas, descripciones o características únicas
2. Las pistas deben ser tipo:
   - Definición: "Animal que ladra" → PERRO
   - Característica: "El planeta más grande del sistema solar" → JUPITER
   - Función: "Se usa para escribir en el pizarrón" → MARCADOR
3. Evita pistas ambiguas o que puedan tener múltiples respuestas
4. Distribuye las palabras balanceadamente entre horizontales (across) y verticales (down)
5. Las posiciones deben formar un crucigrama coherente donde las palabras se crucen naturalmente
6. Numera las pistas en orden de lectura (de arriba a abajo, de izquierda a derecha)
7. INCLUYE la longitud de cada respuesta en letras

Ejemplo de buenas pistas:
- "Capital de Francia (5 letras)" → PARIS
- "Órgano que bombea sangre (7 letras)" → CORAZON
- "Estrella más cercana a la Tierra (3 letras)" → SOL

RESPONDE ÚNICAMENTE CON EL JSON EN EL SIGUIENTE FORMATO. NO agregues texto adicional.

Formato JSON OBLIGATORIO:
{{
    "title": "Crucigrama: [Título sobre el tema]",
    "description": "Breve descripción",
    "clues": {{
        "across": [
            {{"number": 1, "clue": "Mamífero marino más grande (7 letras)", "answer": "BALLENA", "length": 7}},
            {{"number": 3, "clue": "Capital de Francia (5 letras)", "answer": "PARIS", "length": 5}}
        ],
        "down": [
            {{"number": 2, "clue": "Gas que respiramos (7 letras)", "answer": "OXIGENO", "length": 7}},
            {{"number": 4, "clue": "Planeta rojo (5 letras)", "answer": "MARTE", "length": 5}}
        ]
    }},
    "grid_size": {{"rows": 15, "cols": 15}}
}}

IMPORTANTE:
- Las pistas "across" son HORIZONTALES
- Las pistas "down" son VERTICALES
- DEBE haber dos objetos separados: "across" y "down"
- Cada pista DEBE incluir: number, clue, answer, length
- La longitud (length) DEBE coincidir exactamente con el número de letras de answer

REGLAS PARA LAS POSICIONES:
- Asegúrate de que las palabras se crucen en al menos una letra común
- Las posiciones row y col empiezan en 0
- Para across: la palabra va horizontalmente desde (row, col) hacia la derecha
- Para down: la palabra va verticalmente desde (row, col) hacia abajo
- Deja espacio entre palabras para que no se superpongan incorrectamente

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return self._normalize_result(result)

    def _clean_json_string(self, content: str) -> str:
        """Clean and extract JSON from AI response that might contain extra text."""
        # Intentar encontrar el JSON dentro del texto
        content = content.strip()

        # Buscar el primer { y el último }
        first_brace = content.find('{')
        last_brace = content.rfind('}')

        if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
            content = content[first_brace:last_brace + 1]

        # Reemplazar comillas simples por dobles (común en respuestas de IA)
        # pero solo fuera de strings para evitar romper el contenido
        # Esta es una solución simple, puede necesitar refinamiento

        return content

    def _normalize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """If the provider returned content as a JSON string, parse it into a dict.

        Returns the same dict but with `content` converted to a Python object when possible.
        """
        content = result.get("content")
        if isinstance(content, str):
            try:
                # Intentar parsear directamente
                parsed = json.loads(content)
                # Si el parsed es una lista, envolverla en un dict
                if isinstance(parsed, list):
                    result["content"] = {"items": parsed}
                else:
                    result["content"] = parsed
            except json.JSONDecodeError as e:
                # Si falla, intentar limpiar el JSON primero
                try:
                    cleaned_content = self._clean_json_string(content)
                    parsed = json.loads(cleaned_content)
                    # Si el parsed es una lista, envolverla en un dict
                    if isinstance(parsed, list):
                        result["content"] = {"items": parsed}
                    else:
                        result["content"] = parsed
                except Exception as clean_error:
                    # Si aún falla, registrar el error y mantener el contenido original
                    print(f"Error parsing JSON: {e}")
                    print(f"Error after cleaning: {clean_error}")
                    print(f"Content preview: {content[:500]}...")
                    result["content"] = {"error": "Failed to parse JSON", "raw_content": content}
            except Exception as e:
                # keep original string if parsing fails (some endpoints return plain text)
                print(f"Unexpected error parsing content: {e}")
                result["content"] = content
        # También manejar el caso cuando el content ya viene como lista (no como string)
        elif isinstance(content, list):
            result["content"] = {"items": content}
        return result

    async def generate_word_search(
        self,
        topic: str,
        num_words: int,
        grid_size: int,
        provider: Optional[AIProvider] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
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

{JSON_FORMAT_INSTRUCTIONS}
"""

        result = await ai_service.generate_content(
            prompt=prompt,
            provider=provider,
            model_name=model_name,
            db=db
        )

        return result


content_generator = ContentGenerator()
