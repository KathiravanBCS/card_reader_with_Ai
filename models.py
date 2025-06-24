from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "postgresql+psycopg2://postgres:kathir2004@localhost:5432/Card Reader"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    image = Column(LargeBinary, nullable=False)
    name = Column(String)
    title = Column(String)
    company_name = Column(String)
    phone_number = Column(String)
    email = Column(String)
    website = Column(String)
    extra_fields = Column(String)  # JSON string for extra fields
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# To create tables, run: Base.metadata.create_all(engine)
