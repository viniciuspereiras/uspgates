from sqlalchemy import create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ARRAY, DateTime, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import sessionmaker

import datetime


engine = create_engine('sqlite:///database.db', echo=False)
Base = declarative_base()

class Status(Base):
    __tablename__ = 'geotec'
    id = Column(Integer, primary_key=True)
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    # booleam
    status = Column(Integer)
    user_session = Column(String(255))
    
Base.metadata.create_all(engine)

Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()




