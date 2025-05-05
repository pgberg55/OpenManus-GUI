from pydantic import BaseModel, Field, RootModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskRequest(BaseModel):
    prompt: str

class Task(BaseModel):
    id: str
    prompt: str
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    output: List[str] = []
    error: Optional[str] = None
    
    def dict(self, *args, **kwargs):
        result = super().dict(*args, **kwargs)
        # Convert datetime objects to ISO format strings for JSON serialization
        result["created_at"] = self.created_at.isoformat()
        result["updated_at"] = self.updated_at.isoformat()
        return result

class ConfigUpdate(RootModel):
    """
    Model for updating the configuration.
    This is a flexible model that can accept any key-value pairs.
    """
    root: Dict[str, Dict[str, Any]]