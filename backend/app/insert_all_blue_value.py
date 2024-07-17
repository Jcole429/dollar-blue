import os
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from utils.get_all_blue import get_all_blue


# Load environment variables from the .env file
load_dotenv()

# Get the database URL from the environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

# Define the base
Base = declarative_base()


class APIData(Base):
    # Define the APIData model
    __tablename__ = 'dollar_blue_historical'
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String)
    value_sell = Column(Integer)
    value_buy = Column(Integer)
    value_average = Column(Integer)


# Create an engine
engine = create_engine(DATABASE_URL)

# Create the table
Base.metadata.create_all(engine)

# Create a configured "Session" class
Session = sessionmaker(bind=engine)

# Create a session
session = Session()

# Get data
data_records = get_all_blue()

# Create instances of the APIData model for each record
api_data_instances = [APIData(date=record[0], value_sell=record[1], value_buy=record[2],
                              value_average=(record[1] + record[2])/2) for record in data_records]

# Add all instances to the session in bulk
session.bulk_save_objects(api_data_instances)

# Commit the transaction
session.commit()

# Close the session
session.close()
