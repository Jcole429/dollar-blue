
import os
import sys
from sqlalchemy import create_engine, Column, Integer, Numeric, Date, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Database configuration
DB_URL = os.getenv('DATABASE_URL')

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)


class ExchangeData(Base):
    # Define the table model
    __tablename__ = "exchange_data_current"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Text, nullable=False)
    source = Column(Text, nullable=False)
    updated_date = Column(Date, nullable=False)
    buy = Column(Numeric, nullable=False)
    sell = Column(Numeric, nullable=False)
    avg = Column(Numeric, nullable=False)
    inserted_at = Column(DateTime, nullable=False)


# Ensure the table is created
Base.metadata.create_all(bind=engine)


def check_and_insert_data(type, source, updated_date, buy, sell):
    session = SessionLocal()
    try:
        # Check if the record already exists
        existing_record = session.query(ExchangeData).filter_by(type=type, source=source, updated_date=updated_date).first()
        if existing_record:
            print(f"Data for {type} from {source} at {updated_date} already exists.")
            return

        # Insert new record
        new_record = ExchangeData(
            type=type,
            source=source,
            updated_date=updated_date,
            buy=buy,
            sell=sell,
            avg=round((buy+sell)/2, 2),
            inserted_at=datetime.utcnow()
        )
        session.add(new_record)
        session.commit()
        print(f"Inserted data for {type} from {source} at {updated_date}.")
    except Exception as e:
        print(f"Database error: {e}", file=sys.stderr)
        session.rollback()
    finally:
        session.close()
