import os
import sys

# Ensure the project root (backend/) is on sys.path so `import app` works when
# running this script as `python scripts\inspect_content.py` (sys.path[0] would
# otherwise be scripts/).
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.activity import Activity


if __name__ == '__main__':
    db = SessionLocal()
    try:
        activities = db.query(Activity).limit(10).all()
        if not activities:
            print('No se encontraron actividades en la tabla.')
        for a in activities:
            print(f"id={a.id} | type(content)={type(a.content)} | len={(len(a.content) if a.content is not None else 0)}")
            # print a short preview
            preview = repr(a.content)
            print(preview[:1000])
            print('-' * 80)
    finally:
        db.close()
