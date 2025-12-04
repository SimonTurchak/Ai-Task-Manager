from sqlalchemy import text
from db import engine


def test_connection():
    with engine.connect() as conn:
        # use text() in SQLAlchemy 2.x
        result = conn.execute(text("SELECT 1"))
        print("DB response:", result.scalar_one())


if __name__ == "__main__":
    test_connection()
