from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import json
import io
import PyPDF2
from docx import Document
from ..database import get_db
from ..models.user import User
from ..models.activity import Activity, ActivityType
from ..schemas.activity import (
    ActivityResponse,
    ExamRequest,
    SummaryRequest,
    ClassActivityRequest,
    RubricRequest,
    WritingCorrectionRequest,
    SlidesRequest,
    EmailRequest,
    SurveyRequest,
    StoryRequest,
    CrosswordRequest,
    WordSearchRequest
)
from ..services.content_generator import content_generator
from ..services.credit_service import credit_service
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/api/content", tags=["Content Generation"])


def _parse_content_safely(content):
    """Safely parse content to dict, handling malformed JSON"""
    if isinstance(content, dict):
        return content
    if isinstance(content, str):
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            # Try to extract JSON from the string
            content = content.strip()
            first_brace = content.find('{')
            last_brace = content.rfind('}')

            if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
                try:
                    return json.loads(content[first_brace:last_brace + 1])
                except:
                    pass

            # If all parsing fails, return error dict with raw content
            return {"error": "Failed to parse JSON from AI", "raw_content": content[:1000]}
    return content


async def save_activity_with_credits(
    db: Session,
    user: User,
    activity_type: ActivityType,
    request_data: dict,
    generated_content: dict
):
    """
    Función auxiliar para guardar actividad y gestionar créditos
    """
    # Parse content safely
    content_value = _parse_content_safely(generated_content.get("content"))

    # Crear actividad
    activity = Activity(
        title=request_data.get("title", f"{activity_type.value.replace('_', ' ').title()}"),
        description=request_data.get("description"),
        activity_type=activity_type,
        content=content_value,
        subject=request_data.get("subject"),
        grade_level=request_data.get("grade_level"),
        is_public=request_data.get("is_public", False),
        ai_provider=request_data.get("ai_provider"),
        model_used=generated_content.get("model"),
        credits_used=generated_content.get("credits_used", 0),
        creator_id=user.id
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    # Deducir créditos si aplica
    if generated_content.get("credits_used", 0) > 0:
        credit_service.deduct_credits(
            db=db,
            user=user,
            amount=generated_content["credits_used"],
            activity_id=activity.id,
            description=f"Generación de {activity_type.value}"
        )

    return activity


@router.post("/exam", response_model=ActivityResponse)
async def generate_exam(
    request: ExamRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera un examen con IA
    """
    try:
        result = await content_generator.generate_exam(
            topic=request.topic,
            num_questions=request.num_questions,
            question_types=request.question_types,
            grade_level=request.grade_level or "General",
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.EXAM,
            request_data={
                "title": f"Examen: {request.topic}",
                "subject": request.topic,
                "grade_level": request.grade_level,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summary", response_model=ActivityResponse)
async def generate_summary(
    request: SummaryRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera un resumen de un texto
    """
    try:
        result = await content_generator.generate_summary(
            text=request.text,
            length=request.length,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.SUMMARY,
            request_data={
                "title": "Resumen generado",
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/class-activity", response_model=ActivityResponse)
async def generate_class_activity(
    request: ClassActivityRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera una actividad de clase
    """
    try:
        result = await content_generator.generate_class_activity(
            topic=request.topic,
            duration_minutes=request.duration_minutes,
            grade_level=request.grade_level,
            objectives=request.objectives,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.CLASS_ACTIVITY,
            request_data={
                "title": f"Actividad: {request.topic}",
                "subject": request.topic,
                "grade_level": request.grade_level,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rubric", response_model=ActivityResponse)
async def generate_rubric(
    request: RubricRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera una rúbrica de evaluación
    """
    try:
        result = await content_generator.generate_rubric(
            topic=request.topic,
            faculty=request.faculty,
            career=request.career,
            semester=request.semester,
            objectives=request.objectives,
            criteria=request.criteria,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.RUBRIC,
            request_data={
                "title": f"Rúbrica: {request.topic}",
                "subject": request.topic,
                "grade_level": request.semester,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/writing-correction", response_model=ActivityResponse)
async def correct_writing(
    request: WritingCorrectionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Corrige un texto
    """
    try:
        result = await content_generator.correct_writing(
            text=request.text,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.WRITING_CORRECTION,
            request_data={
                "title": "Corrección de escritura",
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/writing-correction-file", response_model=ActivityResponse)
async def correct_writing_file(
    file: UploadFile = File(...),
    ai_provider: str = Form(...),
    model_name: str = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Corrige un archivo PDF o Word
    """
    try:
        # Leer el contenido del archivo
        content = await file.read()

        # Extraer texto según el tipo de archivo
        text = ""
        file_extension = file.filename.split('.')[-1].lower()

        if file_extension == 'pdf':
            # Extraer texto de PDF
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

        elif file_extension in ['doc', 'docx']:
            # Extraer texto de Word
            doc_file = io.BytesIO(content)
            doc = Document(doc_file)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"

        else:
            raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Use PDF o Word (.doc, .docx)")

        if not text.strip():
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del archivo")

        # Convertir ai_provider string a enum
        from ..models.activity import AIProvider
        provider_enum = AIProvider(ai_provider)

        # Corregir el texto
        result = await content_generator.correct_writing(
            text=text,
            provider=provider_enum,
            model_name=model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.WRITING_CORRECTION,
            request_data={
                "title": f"Corrección: {file.filename}",
                "ai_provider": provider_enum
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/slides", response_model=ActivityResponse)
async def generate_slides(
    request: SlidesRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera contenido para diapositivas
    """
    try:
        result = await content_generator.generate_slides(
            topic=request.topic,
            num_slides=request.num_slides,
            grade_level=request.grade_level or "General",
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.SLIDES,
            request_data={
                "title": f"Presentación: {request.topic}",
                "subject": request.topic,
                "grade_level": request.grade_level,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/email", response_model=ActivityResponse)
async def generate_email(
    request: EmailRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera texto para un correo electrónico
    """
    try:
        result = await content_generator.generate_email(
            purpose=request.purpose,
            recipient_type=request.recipient_type,
            tone=request.tone,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.EMAIL,
            request_data={
                "title": f"Email: {request.purpose}",
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/survey", response_model=ActivityResponse)
async def generate_survey(
    request: SurveyRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera una encuesta
    """
    try:
        result = await content_generator.generate_survey(
            topic=request.topic,
            num_questions=request.num_questions,
            question_types=request.question_types,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.SURVEY,
            request_data={
                "title": f"Encuesta: {request.topic}",
                "subject": request.topic,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/story", response_model=ActivityResponse)
async def generate_story(
    request: StoryRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera un cuento, fábula o aventura
    """
    try:
        result = await content_generator.generate_story(
            theme=request.theme,
            story_type=request.story_type,
            characters=request.characters,
            moral=request.moral,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.STORY,
            request_data={
                "title": f"{request.story_type.capitalize()}: {request.theme}",
                "subject": request.theme,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/crossword", response_model=ActivityResponse)
async def generate_crossword(
    request: CrosswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera un crucigrama
    """
    try:
        result = await content_generator.generate_crossword(
            topic=request.topic,
            num_words=request.num_words,
            difficulty=request.difficulty,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.CROSSWORD,
            request_data={
                "title": f"Crucigrama: {request.topic}",
                "subject": request.topic,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/word-search", response_model=ActivityResponse)
async def generate_word_search(
    request: WordSearchRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera una sopa de letras
    """
    try:
        result = await content_generator.generate_word_search(
            topic=request.topic,
            num_words=request.num_words,
            grid_size=request.grid_size,
            provider=request.ai_provider,
            model_name=request.model_name
        )

        activity = await save_activity_with_credits(
            db=db,
            user=current_user,
            activity_type=ActivityType.WORD_SEARCH,
            request_data={
                "title": f"Sopa de letras: {request.topic}",
                "subject": request.topic,
                "ai_provider": request.ai_provider
            },
            generated_content=result
        )

        return ActivityResponse.from_orm(activity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
