from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from db import get_db
import models
import schemas
from auth import get_current_user

app = FastAPI()


# Allow frontend dev server to call the API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # or ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],
)

# ------------------ HEALTH CHECK ------------------


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ------------------ NOTES ENDPOINTS ------------------


@app.get("/notes", response_model=List[schemas.Note])
def list_notes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all notes for the current user."""
    notes = (
        db.query(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .order_by(models.Note.created_at.desc())
        .all()
    )
    return notes


@app.post("/notes", response_model=schemas.Note)
def create_note(
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new note for the current user."""
    note = models.Note(
        user_id=current_user.id,
        title=note_in.title,
        content=note_in.content,
        tags=note_in.tags,
    )

    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@app.get("/notes/{note_id}", response_model=schemas.Note)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single note by ID (only if it belongs to the current user)."""
    note = (
        db.query(models.Note)
        .filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id,
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return note


@app.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    note_in: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update fields of a note (only if it belongs to the current user)."""
    note = (
        db.query(models.Note)
        .filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id,
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    update_data = note_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note


@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a note (only if it belongs to the current user)."""
    note = (
        db.query(models.Note)
        .filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id,
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    db.delete(note)
    db.commit()
    return  # 204 No Content


# ------------------ TASKS ENDPOINTS ------------------


@app.get("/tasks", response_model=List[schemas.Task])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all tasks for the current user."""
    tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )
    return tasks


@app.post("/tasks", response_model=schemas.Task)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new task for the current user."""
    task = models.Task(
        user_id=current_user.id,
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        note_id=task_in.note_id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single task by ID (only if it belongs to the current user)."""
    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update fields of a task (only if it belongs to the current user)."""
    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a task (only if it belongs to the current user)."""
    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()
    return  # 204 No Content

def build_basic_assistant_reply(message: str, notes, tasks) -> str:
    """
    Very simple rule-based helper so the chatbot works without an AI API.
    Later you can replace this function with a real LLM call.
    """
    message_lower = message.lower()

    if "summary" in message_lower or "summarize" in message_lower:
        if not notes and not tasks:
            return "You don't have any notes or tasks yet, so there isn't much to summarize. Try adding a note or a task first."

        lines = []
        if notes:
            lines.append("Here is a quick summary of your recent notes:")
            for n in notes[:5]:
                lines.append(f"- Note {n.id}: {n.title}")
        if tasks:
            lines.append("")
            lines.append("And here are some of your tasks:")
            for t in tasks[:5]:
                lines.append(f"- [{t.status}] {t.title} (priority: {t.priority})")

        return "\n".join(lines)

    if "what should i do" in message_lower or "next" in message_lower:
        if not tasks:
            return "You don't have any tasks yet. Maybe start by creating 2–3 concrete tasks based on your notes (for example: 'Send CV to company X', 'Prepare for interview')."

        high = [t for t in tasks if t.priority == "high"]
        if high:
            top = high[0]
            return (
                f"I would start with your highest-priority task: '{top.title}'. "
                f"Its status is '{top.status}'. Try to move it to 'in_progress' today."
            )

        first = tasks[0]
        return (
            f"Your next step could be: '{first.title}' (priority: {first.priority}). "
            "Pick a small sub-step you can finish in 30 minutes."
        )

    # default generic reply
    return (
        "I'm a simple assistant right now. You can ask me things like:\n"
        "- 'Give me a summary of my notes'\n"
        "- 'Summarize my tasks'\n"
        "- 'What should I do next?'\n"
        "Later you can upgrade me to a real AI model by replacing the build_basic_assistant_reply function."
    )


@app.post("/assistant/chat", response_model=schemas.ChatResponse)
def chat_with_assistant(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Very simple assistant endpoint that has access to the current user's notes and tasks.
    """
    notes = (
        db.query(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .order_by(models.Note.created_at.desc())
        .all()
    )
    tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )

    reply_text = build_basic_assistant_reply(payload.message, notes, tasks)
    return {"reply": reply_text}
