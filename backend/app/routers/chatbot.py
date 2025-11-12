from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import User, Chatbot, ChatConversation, ChatMessage, ChatbotType
from ..schemas.chatbot import (
    ChatbotCreate,
    ChatbotUpdate,
    ChatbotResponse,
    ChatConversationResponse,
    ChatRequest,
    ChatResponse,
    ChatMessageResponse
)
from ..utils.auth import get_current_user
from ..services.ai_service import AIService
from datetime import datetime

router = APIRouter(prefix="/api/chatbots", tags=["chatbots"])


# Template configurations
CHATBOT_TEMPLATES = {
    "math": {
        "name": "Tutor de Matemáticas",
        "description": "Asistente especializado en resolver problemas matemáticos y explicar conceptos",
        "personality": "Eres un tutor de matemáticas paciente y didáctico. Explicas conceptos paso a paso y usas ejemplos claros.",
        "knowledge_areas": ["Álgebra", "Geometría", "Cálculo", "Trigonometría", "Estadística"],
        "instruction_prompt": "Eres un tutor experto en matemáticas. Tu objetivo es ayudar a los estudiantes a entender conceptos matemáticos de manera clara y didáctica. Siempre explica paso a paso, usa ejemplos y verifica la comprensión del estudiante. Adapta tu lenguaje al nivel del estudiante."
    },
    "language": {
        "name": "Profesor de Idiomas",
        "description": "Ayuda con gramática, vocabulario y práctica conversacional",
        "personality": "Eres un profesor de idiomas entusiasta y motivador. Corriges errores de forma constructiva.",
        "knowledge_areas": ["Gramática", "Vocabulario", "Conversación", "Lectura", "Escritura"],
        "instruction_prompt": "Eres un profesor de idiomas especializado. Ayudas a los estudiantes a mejorar su gramática, ampliar su vocabulario y practicar conversación. Corriges errores de manera constructiva y ofreces explicaciones claras. Adapta el nivel de dificultad según el estudiante."
    },
    "science": {
        "name": "Tutor de Ciencias",
        "description": "Explica conceptos de física, química y biología de manera simple",
        "personality": "Eres un tutor científico que hace accesible la ciencia. Usas analogías y ejemplos cotidianos.",
        "knowledge_areas": ["Física", "Química", "Biología", "Ciencias Naturales"],
        "instruction_prompt": "Eres un tutor de ciencias apasionado. Tu objetivo es hacer la ciencia accesible y comprensible. Usa analogías, ejemplos cotidianos y explicaciones visuales cuando sea posible. Fomenta la curiosidad científica."
    },
    "literature": {
        "name": "Guía Literario",
        "description": "Análisis de textos, comprensión lectora y escritura creativa",
        "personality": "Eres un guía literario culto y reflexivo. Fomentas el pensamiento crítico y la creatividad.",
        "knowledge_areas": ["Literatura", "Análisis literario", "Redacción", "Poesía", "Escritura creativa"],
        "instruction_prompt": "Eres un guía literario experto. Ayudas a los estudiantes a analizar textos, comprender su significado profundo y desarrollar habilidades de escritura. Fomentas el pensamiento crítico y la apreciación literaria."
    },
    "programming": {
        "name": "Mentor de Programación",
        "description": "Enseña conceptos de programación y ayuda a resolver errores de código",
        "personality": "Eres un mentor de programación experimentado. Enseñas buenas prácticas y debugging.",
        "knowledge_areas": ["Python", "JavaScript", "HTML/CSS", "Algoritmos", "Debugging"],
        "instruction_prompt": "Eres un mentor de programación experimentado. Enseñas conceptos de programación de forma práctica, ayudas a debuggear código y fomentas buenas prácticas. Explicas con ejemplos de código y promueves el aprendizaje hands-on."
    },
    "wellness": {
        "name": "Coach de Bienestar",
        "description": "Apoyo emocional, técnicas de estudio y manejo del estrés",
        "personality": "Eres un coach de bienestar empático y motivador. Ofreces consejos prácticos.",
        "knowledge_areas": ["Mindfulness", "Técnicas de estudio", "Gestión del estrés", "Motivación", "Organización"],
        "instruction_prompt": "Eres un coach de bienestar estudiantil. Ofreces apoyo emocional, técnicas de estudio efectivas y estrategias para manejar el estrés. Eres empático, motivador y práctico en tus consejos."
    }
}


@router.post("/", response_model=ChatbotResponse)
async def create_chatbot(
    chatbot: ChatbotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear un nuevo chatbot"""
    # Si es un tipo template, usar configuración predefinida
    if chatbot.chatbot_type.value in CHATBOT_TEMPLATES and chatbot.chatbot_type.value != "custom":
        template = CHATBOT_TEMPLATES[chatbot.chatbot_type.value]
        chatbot.personality = chatbot.personality or template["personality"]
        chatbot.knowledge_areas = chatbot.knowledge_areas or template["knowledge_areas"]
        chatbot.instruction_prompt = chatbot.instruction_prompt or template["instruction_prompt"]
        if not chatbot.name or chatbot.name == template["name"]:
            chatbot.name = template["name"]
        if not chatbot.description:
            chatbot.description = template["description"]

    db_chatbot = Chatbot(
        **chatbot.model_dump(),
        creator_id=current_user.id
    )
    db.add(db_chatbot)
    db.commit()
    db.refresh(db_chatbot)
    return db_chatbot


@router.get("/", response_model=List[ChatbotResponse])
async def get_my_chatbots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener todos los chatbots del usuario actual"""
    chatbots = db.query(Chatbot).filter(
        Chatbot.creator_id == current_user.id
    ).order_by(Chatbot.created_at.desc()).all()
    return chatbots


@router.get("/templates")
async def get_chatbot_templates():
    """Obtener plantillas de chatbots disponibles"""
    return CHATBOT_TEMPLATES


@router.get("/{chatbot_id}", response_model=ChatbotResponse)
async def get_chatbot(
    chatbot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener un chatbot específico"""
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado")

    # Verificar permisos
    if chatbot.creator_id != current_user.id and not chatbot.is_public:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver este chatbot")

    return chatbot


@router.put("/{chatbot_id}", response_model=ChatbotResponse)
async def update_chatbot(
    chatbot_id: int,
    chatbot_update: ChatbotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar un chatbot"""
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado")

    if chatbot.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este chatbot")

    update_data = chatbot_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chatbot, field, value)

    db.commit()
    db.refresh(chatbot)
    return chatbot


@router.delete("/{chatbot_id}")
async def delete_chatbot(
    chatbot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar un chatbot"""
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado")

    if chatbot.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este chatbot")

    db.delete(chatbot)
    db.commit()
    return {"message": "Chatbot eliminado correctamente"}


@router.post("/{chatbot_id}/chat", response_model=ChatResponse)
async def chat_with_bot(
    chatbot_id: int,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enviar un mensaje al chatbot"""
    # Obtener chatbot
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado")

    if not chatbot.is_active:
        raise HTTPException(status_code=400, detail="Este chatbot está desactivado")

    # Verificar permisos
    if chatbot.creator_id != current_user.id and not chatbot.is_public:
        raise HTTPException(status_code=403, detail="No tienes permisos para usar este chatbot")

    # Obtener o crear conversación
    if chat_request.conversation_id:
        conversation = db.query(ChatConversation).filter(
            ChatConversation.id == chat_request.conversation_id,
            ChatConversation.user_id == current_user.id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
    else:
        conversation = ChatConversation(
            chatbot_id=chatbot_id,
            user_id=current_user.id,
            title=f"Chat con {chatbot.name}"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Guardar mensaje del usuario
    user_message = ChatMessage(
        conversation_id=conversation.id,
        content=chat_request.message,
        role="user"
    )
    db.add(user_message)
    db.commit()

    # Obtener historial de mensajes para contexto
    messages = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation.id
    ).order_by(ChatMessage.created_at).all()

    # Preparar contexto para la IA
    context_messages = []
    for msg in messages[:-1]:  # Excluir el último mensaje (ya lo tenemos)
        context_messages.append({
            "role": msg.role,
            "content": msg.content
        })

    # Generar respuesta con IA
    try:
        ai_service = AIService(
            provider=chatbot.ai_provider,
            model_name=chatbot.model_name
        )

        # Construir prompt con instrucciones del chatbot
        system_prompt = chatbot.instruction_prompt
        if chatbot.personality:
            system_prompt += f"\n\nPersonalidad: {chatbot.personality}"
        if chatbot.knowledge_areas:
            system_prompt += f"\n\nÁreas de conocimiento: {', '.join(chatbot.knowledge_areas)}"

        response = await ai_service.generate_chat_response(
            message=chat_request.message,
            system_prompt=system_prompt,
            conversation_history=context_messages,
            temperature=chatbot.temperature / 100.0  # Convertir de 0-100 a 0-1
        )

        # Guardar respuesta del chatbot
        bot_message = ChatMessage(
            conversation_id=conversation.id,
            content=response,
            role="assistant"
        )
        db.add(bot_message)

        # Actualizar timestamp de conversación
        conversation.updated_at = datetime.now()

        db.commit()

        return ChatResponse(
            message=response,
            conversation_id=conversation.id,
            chatbot_id=chatbot_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar respuesta: {str(e)}")


@router.get("/{chatbot_id}/conversations", response_model=List[ChatConversationResponse])
async def get_chatbot_conversations(
    chatbot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener todas las conversaciones del chatbot"""
    conversations = db.query(ChatConversation).filter(
        ChatConversation.chatbot_id == chatbot_id,
        ChatConversation.user_id == current_user.id
    ).order_by(ChatConversation.updated_at.desc()).all()
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ChatConversationResponse)
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener una conversación específica con todos sus mensajes"""
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar una conversación"""
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    db.delete(conversation)
    db.commit()
    return {"message": "Conversación eliminada correctamente"}
