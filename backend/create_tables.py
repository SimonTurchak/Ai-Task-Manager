from db import Base, engine
import models  # ensure models are imported so metadata knows about them


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created.")


if __name__ == "__main__":
    create_tables()
