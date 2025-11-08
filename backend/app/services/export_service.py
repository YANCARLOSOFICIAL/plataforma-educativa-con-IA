from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from io import BytesIO
from typing import Dict, Any
import json


class ExportService:
    """
    Servicio para exportar actividades a Word y Excel
    """

    def export_to_word(self, activity_data: Dict[str, Any], activity_type: str) -> BytesIO:
        """
        Exporta una actividad a formato Word
        """
        document = Document()

        # Título
        title = document.add_heading(activity_data.get("title", "Actividad Educativa"), 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Descripción
        if "description" in activity_data:
            document.add_paragraph(activity_data["description"])
            document.add_paragraph()

        # Contenido específico según el tipo
        if activity_type == "exam":
            self._add_exam_to_word(document, activity_data)
        elif activity_type == "summary":
            self._add_summary_to_word(document, activity_data)
        elif activity_type == "class_activity":
            self._add_class_activity_to_word(document, activity_data)
        elif activity_type == "rubric":
            self._add_rubric_to_word(document, activity_data)
        elif activity_type == "writing_correction":
            self._add_correction_to_word(document, activity_data)
        elif activity_type == "slides":
            self._add_slides_to_word(document, activity_data)
        elif activity_type == "email":
            self._add_email_to_word(document, activity_data)
        elif activity_type == "survey":
            self._add_survey_to_word(document, activity_data)
        elif activity_type == "story":
            self._add_story_to_word(document, activity_data)

        # Guardar en buffer
        buffer = BytesIO()
        document.save(buffer)
        buffer.seek(0)
        return buffer

    def export_to_excel(self, activity_data: Dict[str, Any], activity_type: str) -> BytesIO:
        """
        Exporta una actividad a formato Excel
        """
        wb = Workbook()
        ws = wb.active

        # Estilo para encabezados
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)

        # Título
        ws['A1'] = activity_data.get("title", "Actividad Educativa")
        ws['A1'].font = Font(size=16, bold=True)
        ws.merge_cells('A1:D1')

        # Contenido específico según el tipo
        if activity_type == "exam":
            self._add_exam_to_excel(ws, activity_data, header_fill, header_font)
        elif activity_type == "survey":
            self._add_survey_to_excel(ws, activity_data, header_fill, header_font)
        elif activity_type == "rubric":
            self._add_rubric_to_excel(ws, activity_data, header_fill, header_font)
        elif activity_type == "crossword":
            self._add_crossword_to_excel(ws, activity_data, header_fill, header_font)
        elif activity_type == "word_search":
            self._add_word_search_to_excel(ws, activity_data, header_fill, header_font)

        # Ajustar ancho de columnas
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(cell.value)
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width

        # Guardar en buffer
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer

    def export_to_pptx(self, activity_data: Dict[str, Any], activity_type: str) -> BytesIO:
        """
        Exporta una actividad de tipo 'slides' a formato PowerPoint (.pptx)
        """
        if activity_type != "slides":
            raise ValueError("Sólo se puede exportar a PPTX actividades de tipo 'slides'")

        prs = Presentation()

        try:
            content = json.loads(activity_data.get("content", "{}")) if isinstance(activity_data.get("content"), str) else activity_data.get("content", {})
        except:
            content = {}

        for slide_data in content.get("slides", []):
            # Usar layout título + contenido si está disponible
            layout = prs.slide_layouts[1] if len(prs.slide_layouts) > 1 else prs.slide_layouts[0]
            slide = prs.slides.add_slide(layout)

            # Título
            title_text = slide_data.get("title", "")
            if title_text:
                if slide.shapes.title:
                    slide.shapes.title.text = title_text

            # Contenido (lista de puntos) -> colocar en el primer placeholder con cuadro de texto
            body_tf = None
            for shape in slide.shapes:
                if hasattr(shape, 'text_frame') and shape.text_frame is not None and not getattr(shape, 'is_placeholder', False):
                    body_tf = shape.text_frame
                    break

            # Si no encontramos text_frame, crear textbox
            if body_tf is None:
                left = PptxInches(1)
                top = PptxInches(1.5)
                width = PptxInches(8)
                height = PptxInches(4.5)
                txBox = slide.shapes.add_textbox(left, top, width, height)
                body_tf = txBox.text_frame

            # Limpiar texto previo
            body_tf.clear()

            for idx, point in enumerate(slide_data.get("content", [])):
                p = body_tf.add_paragraph()
                p.text = point
                p.level = 0
                try:
                    p.font.size = PptxPt(18)
                except:
                    pass

            # Notas de la diapositiva
            if "notes" in slide_data and slide.notes_slide is not None:
                try:
                    slide.notes_slide.notes_text_frame.text = slide_data.get("notes", "")
                except:
                    pass

        buffer = BytesIO()
        prs.save(buffer)
        buffer.seek(0)
        return buffer

    # Métodos auxiliares para Word
    def _add_exam_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        if "instructions" in content:
            doc.add_heading("Instrucciones", 2)
            doc.add_paragraph(content["instructions"])

        doc.add_heading("Preguntas", 2)
        for q in content.get("questions", []):
            p = doc.add_paragraph()
            p.add_run(f"Pregunta {q.get('id', 0)}: ").bold = True
            p.add_run(q.get("question", ""))

            if q.get("type") == "multiple_choice" and "options" in q:
                for opt in q["options"]:
                    doc.add_paragraph(f"  {opt}", style='List Bullet')

            doc.add_paragraph()

    def _add_summary_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        doc.add_heading("Resumen", 2)
        doc.add_paragraph(content.get("summary", ""))

        if "key_points" in content:
            doc.add_heading("Puntos Clave", 2)
            for point in content["key_points"]:
                doc.add_paragraph(point, style='List Bullet')

    def _add_class_activity_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        if "objectives" in content:
            doc.add_heading("Objetivos", 2)
            for obj in content["objectives"]:
                doc.add_paragraph(obj, style='List Bullet')

        if "materials" in content:
            doc.add_heading("Materiales", 2)
            for mat in content["materials"]:
                doc.add_paragraph(mat, style='List Bullet')

        if "steps" in content:
            doc.add_heading("Pasos de la Actividad", 2)
            for step in content["steps"]:
                p = doc.add_paragraph()
                p.add_run(f"Paso {step.get('step', 0)} ({step.get('duration_minutes', 0)} min): ").bold = True
                p.add_run(step.get("description", ""))

    def _add_rubric_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        doc.add_heading("Rúbrica de Evaluación", 2)

        for criterion in content.get("criteria", []):
            doc.add_heading(f"{criterion.get('name', '')} ({criterion.get('weight', 0)}%)", 3)

            table = doc.add_table(rows=1, cols=3)
            table.style = 'Light Grid Accent 1'

            hdr_cells = table.rows[0].cells
            hdr_cells[0].text = 'Nivel'
            hdr_cells[1].text = 'Puntos'
            hdr_cells[2].text = 'Descripción'

            for level in criterion.get("levels", []):
                row_cells = table.add_row().cells
                row_cells[0].text = level.get("level", "")
                row_cells[1].text = str(level.get("points", ""))
                row_cells[2].text = level.get("description", "")

            doc.add_paragraph()

    def _add_correction_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        doc.add_heading("Texto Original", 2)
        doc.add_paragraph(content.get("original_text", ""))

        doc.add_heading("Texto Corregido", 2)
        doc.add_paragraph(content.get("corrected_text", ""))

        if "errors" in content and content["errors"]:
            doc.add_heading("Errores Detectados", 2)
            for error in content["errors"]:
                p = doc.add_paragraph()
                p.add_run(f"{error.get('type', '').capitalize()}: ").bold = True
                p.add_run(f"'{error.get('original', '')}' → '{error.get('correction', '')}'\n")
                p.add_run(f"Explicación: {error.get('explanation', '')}")

    def _add_slides_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        for slide in content.get("slides", []):
            doc.add_heading(f"Diapositiva {slide.get('slide_number', 0)}: {slide.get('title', '')}", 2)

            for point in slide.get("content", []):
                doc.add_paragraph(point, style='List Bullet')

            if "notes" in slide:
                p = doc.add_paragraph()
                p.add_run("Notas: ").italic = True
                p.add_run(slide["notes"])

            doc.add_paragraph()

    def _add_email_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        doc.add_heading("Asunto", 2)
        doc.add_paragraph(content.get("subject", ""))

        doc.add_heading("Cuerpo del Mensaje", 2)
        doc.add_paragraph(content.get("body", ""))

        doc.add_paragraph()
        doc.add_paragraph(content.get("closing", ""))

    def _add_survey_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        if "description" in content:
            doc.add_paragraph(content["description"])

        doc.add_heading("Preguntas", 2)
        for q in content.get("questions", []):
            p = doc.add_paragraph()
            p.add_run(f"{q.get('id', 0)}. {q.get('question', '')}").bold = True

            if q.get("type") == "multiple_choice" and "options" in q:
                for opt in q["options"]:
                    doc.add_paragraph(f"  {opt}", style='List Bullet')

            doc.add_paragraph()

    def _add_story_to_word(self, doc: Document, data: Dict):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        doc.add_paragraph(content.get("story", ""))

        if "moral" in content:
            doc.add_heading("Moraleja", 2)
            doc.add_paragraph(content["moral"])

    # Métodos auxiliares para Excel
    def _add_exam_to_excel(self, ws, data: Dict, header_fill, header_font):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        row = 3
        ws[f'A{row}'] = "No."
        ws[f'B{row}'] = "Pregunta"
        ws[f'C{row}'] = "Tipo"
        ws[f'D{row}'] = "Respuesta Correcta"

        for cell in [ws[f'A{row}'], ws[f'B{row}'], ws[f'C{row}'], ws[f'D{row}']]:
            cell.fill = header_fill
            cell.font = header_font

        row += 1
        for q in content.get("questions", []):
            ws[f'A{row}'] = q.get("id", "")
            ws[f'B{row}'] = q.get("question", "")
            ws[f'C{row}'] = q.get("type", "")
            ws[f'D{row}'] = q.get("correct_answer", "")
            row += 1

    def _add_survey_to_excel(self, ws, data: Dict, header_fill, header_font):
        self._add_exam_to_excel(ws, data, header_fill, header_font)

    def _add_rubric_to_excel(self, ws, data: Dict, header_fill, header_font):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        row = 3
        for criterion in content.get("criteria", []):
            ws[f'A{row}'] = criterion.get("name", "")
            ws[f'A{row}'].font = Font(bold=True)
            ws.merge_cells(f'A{row}:D{row}')
            row += 1

            ws[f'A{row}'] = "Nivel"
            ws[f'B{row}'] = "Puntos"
            ws[f'C{row}'] = "Descripción"

            for cell in [ws[f'A{row}'], ws[f'B{row}'], ws[f'C{row}']]:
                cell.fill = header_fill
                cell.font = header_font

            row += 1
            for level in criterion.get("levels", []):
                ws[f'A{row}'] = level.get("level", "")
                ws[f'B{row}'] = level.get("points", "")
                ws[f'C{row}'] = level.get("description", "")
                row += 1

            row += 1

    def _add_crossword_to_excel(self, ws, data: Dict, header_fill, header_font):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        row = 3
        ws[f'A{row}'] = "Dirección"
        ws[f'B{row}'] = "No."
        ws[f'C{row}'] = "Pista"
        ws[f'D{row}'] = "Respuesta"

        for cell in [ws[f'A{row}'], ws[f'B{row}'], ws[f'C{row}'], ws[f'D{row}']]:
            cell.fill = header_fill
            cell.font = header_font

        row += 1
        clues = content.get("clues", {})

        for clue in clues.get("across", []):
            ws[f'A{row}'] = "Horizontal"
            ws[f'B{row}'] = clue.get("number", "")
            ws[f'C{row}'] = clue.get("clue", "")
            ws[f'D{row}'] = clue.get("answer", "")
            row += 1

        for clue in clues.get("down", []):
            ws[f'A{row}'] = "Vertical"
            ws[f'B{row}'] = clue.get("number", "")
            ws[f'C{row}'] = clue.get("clue", "")
            ws[f'D{row}'] = clue.get("answer", "")
            row += 1

    def _add_word_search_to_excel(self, ws, data: Dict, header_fill, header_font):
        try:
            content = json.loads(data.get("content", "{}")) if isinstance(data.get("content"), str) else data.get("content", {})
        except:
            content = {}

        row = 3
        ws[f'A{row}'] = "Palabras a buscar"
        ws[f'A{row}'].font = Font(bold=True)
        row += 1

        for word_data in content.get("words", []):
            ws[f'A{row}'] = word_data.get("word", "")
            ws[f'B{row}'] = word_data.get("hint", "")
            row += 1

        # Agregar la cuadrícula si existe
        if "grid" in content:
            row += 2
            ws[f'A{row}'] = "Sopa de Letras"
            ws[f'A{row}'].font = Font(bold=True)
            row += 1

            for grid_row in content["grid"]:
                for col_idx, letter in enumerate(grid_row):
                    ws.cell(row=row, column=col_idx + 1, value=letter)
                    ws.cell(row=row, column=col_idx + 1).alignment = Alignment(horizontal='center')
                row += 1


export_service = ExportService()
