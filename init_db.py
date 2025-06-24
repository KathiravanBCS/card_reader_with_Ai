from models import Base, engine

if __name__ == "__main__":
    print("Dropping and recreating tables...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    print("Done.")
