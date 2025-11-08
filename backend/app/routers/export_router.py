from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, UserRole
from ..models.activity import Activity
from ..services.export_service import export_service
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/{activity_id}/word")
async def export_activity_to_word(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Exporta una actividad a formato Word
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    # Verificar permisos
    if not activity.is_public and activity.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="No tienes permiso para exportar esta actividad")

    try:
        # Preparar datos para exportación
        activity_data = {
            "title": activity.title,
            "description": activity.description,
            "content": activity.content
        }

        # Generar documento Word
        buffer = export_service.export_to_word(activity_data, activity.activity_type.value)

        # Crear nombre de archivo
        filename = f"{activity.title.replace(' ', '_')}.docx"

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al exportar: {str(e)}")


@router.get("/{activity_id}/pptx")
async def export_activity_to_pptx(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Exporta una actividad tipo 'slides' a PowerPoint (.pptx)
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    # Verificar permisos
    if not activity.is_public and activity.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="No tienes permiso para exportar esta actividad")

    # Solo para slides
    if activity.activity_type.value != "slides":
        raise HTTPException(status_code=400, detail=f"El tipo de actividad '{activity.activity_type.value}' no es exportable a PPTX")

    try:
        activity_data = {
            "title": activity.title,
            "description": activity.description,
            "content": activity.content
        }

        buffer = export_service.export_to_pptx(activity_data, activity.activity_type.value)

        filename = f"{activity.title.replace(' ', '_')}.pptx"

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al exportar: {str(e)}")


@router.get("/{activity_id}/excel")
async def export_activity_to_excel(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Exporta una actividad a formato Excel
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    # Verificar permisos
    if not activity.is_public and activity.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="No tienes permiso para exportar esta actividad")

    # Verificar que el tipo de actividad sea exportable a Excel
    exportable_types = ["exam", "survey", "rubric", "crossword", "word_search"]
    if activity.activity_type.value not in exportable_types:
        raise HTTPException(
            status_code=400,
            detail=f"El tipo de actividad '{activity.activity_type.value}' no es exportable a Excel. Solo se pueden exportar: {', '.join(exportable_types)}"
        )

    try:
        # Preparar datos para exportación
        activity_data = {
            "title": activity.title,
            "description": activity.description,
            "content": activity.content
        }

        # Debug: Log del contenido
        print(f"\n=== EXPORTANDO A EXCEL ===")
        print(f"Tipo: {activity.activity_type.value}")
        print(f"Título: {activity.title}")
        print(f"Contenido (primeros 200 chars): {str(activity.content)[:200]}")

        # Generar documento Excel
        buffer = export_service.export_to_excel(activity_data, activity.activity_type.value)

        # Crear nombre de archivo seguro
        safe_filename = "".join(c for c in activity.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_filename = safe_filename.replace(' ', '_')[:50]  # Limitar longitud
        filename = f"{safe_filename}.xlsx"

        print(f"Archivo generado exitosamente: {filename}\n")

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except ValueError as e:
        print(f"Error de validación: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error inesperado al exportar: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al exportar: {str(e)}")
