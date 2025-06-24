from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "postgresql+psycopg2://postgres:kathir2004@localhost:5432/card_reader"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    image = Column(LargeBinary, nullable=False)
    name = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    company_description = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    extra_fields = Column(Text, nullable=True)  # JSON string for extra fields
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# To create tables, run: Base.metadata.create_all(engine)
