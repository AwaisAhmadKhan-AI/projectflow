"""
SQLAlchemy engine and session setup.

`SessionLocal` is a factory for Session objects. We create one Session
per request (see `get_db` dependency below) rather than sharing a
single global session, because sessions are not safe to share across
concurrent requests — each one tracks its own unit-of-work / identity map.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    """Declarative base class all ORM models inherit from."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session for the duration
    of a single request and always closes it afterward, even if the
    request raised an exception.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
