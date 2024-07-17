import os
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from utils.get_latest_blue import get_latest_blue


# Load environment variables from the .env file
load_dotenv()

# Get the database URL from the environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

# Define the base
Base = declarative_base()

# Define the APIData model


class APIData(Base):
    __tablename__ = 'value_ars'
    id = Column(Integer, primary_key=True, autoincrement=True)
    datetime = Column(String)
    value = Column(Integer)


# Create an engine
engine = create_engine(DATABASE_URL)

# Create the table
Base.metadata.create_all(engine)

# Create a configured "Session" class
Session = sessionmaker(bind=engine)

# Create a session
session = Session()

# Get data
last_price, last_update = get_latest_blue()

# Create an instance of the APIData model
api_data_instance = APIData(datetime=last_update, value=last_price)

# Add the instance to the session
session.add(api_data_instance)

# Commit the transaction
session.commit()

# Close the session
session.close()
