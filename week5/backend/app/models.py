from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey, Table, Index
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# Association table for many-to-many relationship between notes and tags
note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", Integer, ForeignKey("notes.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
    Index('ix_note_tags_note_id', 'note_id'),
    Index('ix_note_tags_tag_id', 'tag_id'),
)


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)

    __table_args__ = (
        Index('ix_notes_title', 'title'),
    )

    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    action_items = relationship("ActionItem", back_populates="note", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    notes = relationship("Note", secondary=note_tags, back_populates="tags")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True, index=True)

    note = relationship("Note", back_populates="action_items")
