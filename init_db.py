from models import Base, engine

if __name__ == "__main__":
    print("Creating tables...")
    Base.metadata.create_all(engine)
    print("Done.")
