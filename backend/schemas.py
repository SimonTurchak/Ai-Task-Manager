from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ---------- NOTE SCHEMAS ----------

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    tags: Optional[str] = None  # comma-separated tags for now


class NoteCreate(NoteBase):
    """What the client sends when creating a note."""
    pass


class Note(NoteBase):
    """What the API returns for a note."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        # for Pydantic v2 (used by recent FastAPI)
        from_attributes = True


class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    tags: Optional[str] = None  # comma-separated tags for now


class NoteCreate(NoteBase):
    """What the client sends when creating a note."""
    pass


class NoteUpdate(BaseModel):
    """Fields that can be updated on a note (all optional)."""
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None


class Note(NoteBase):
    """What the API returns for a note."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- TASK SCHEMAS ----------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    note_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    note_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    note_id: Optional[int] = None


class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
