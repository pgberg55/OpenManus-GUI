from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import time
import toml
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from apps.api.models import TaskRequest, Task, TaskStatus, ConfigUpdate
from apps.api.openmanus import simulate_openmanus_output

# Path to the config file
CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../config/config.toml"))

# Initialize FastAPI app
app = FastAPI(title="OpenManus API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for task history
# In a production app, this would be a database
task_history: List[Task] = []

@app.get("/")
async def root():
    return {"message": "OpenManus API is running"}

@app.post("/run")
async def run_task(request: TaskRequest, background_tasks: BackgroundTasks):
    """
    Run an OpenManus task with the given prompt.
    Returns a streaming response with the output.
    """
    task_id = str(uuid.uuid4())
    task = Task(
        id=task_id,
        prompt=request.prompt,
        status=TaskStatus.RUNNING,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        output=[]
    )
    
    # Add task to history
    task_history.append(task)
    
    # Keep only the last 20 tasks
    if len(task_history) > 20:
        task_history.pop(0)
    
    async def generate_output():
        try:
            async for line in simulate_openmanus_output(request.prompt):
                # Update task output
                task.output.append(line)
                task.updated_at = datetime.now()
                
                # Yield the line as a server-sent event
                yield f"data: {json.dumps({'id': task_id, 'line': line})}\n\n"
            
            # Mark task as completed
            task.status = TaskStatus.COMPLETED
            task.updated_at = datetime.now()
            yield f"data: {json.dumps({'id': task_id, 'status': 'completed'})}\n\n"
        except Exception as e:
            # Mark task as failed
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.updated_at = datetime.now()
            yield f"data: {json.dumps({'id': task_id, 'status': 'failed', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_output(),
        media_type="text/event-stream"
    )

@app.get("/history")
async def get_history():
    """
    Get the last 20 tasks.
    """
    return task_history

@app.get("/config")
async def get_config():
    """
    Get the current configuration from the config.toml file.
    """
    try:
        if not os.path.exists(CONFIG_PATH):
            return {}
        
        with open(CONFIG_PATH, "r") as f:
            config = toml.load(f)
        
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load config: {str(e)}")

@app.post("/config")
async def update_config(config_update: Dict[str, Any]):
    """
    Update the configuration in the config.toml file.
    """
    try:
        # Load the current config
        current_config = {}
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                current_config = toml.load(f)
        
        # Update the config with the new values
        for section, values in config_update.items():
            if section not in current_config:
                current_config[section] = {}
            
            if isinstance(values, dict):
                for key, value in values.items():
                    current_config[section][key] = value
        
        # Write the updated config back to the file
        with open(CONFIG_PATH, "w") as f:
            toml.dump(current_config, f)
        
        return {"message": "Configuration updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update config: {str(e)}")

@app.websocket("/ws/run")
async def websocket_run_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        request_data = json.loads(data)
        prompt = request_data.get("prompt", "")
        
        if not prompt:
            await websocket.send_json({
                "type": "error",
                "content": "Prompt is required"
            })
            return
        
        task_id = str(uuid.uuid4())
        
        # Create a new task
        task = Task(
            id=task_id,
            prompt=prompt,
            status=TaskStatus.RUNNING,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            output=[]
        )
        
        # Add task to history
        task_history.append(task)
        
        # Keep only the last 20 tasks
        if len(task_history) > 20:
            task_history.pop(0)
        
        # Generate and send output
        try:
            async for line in simulate_openmanus_output(prompt):
                # Update task output
                task.output.append(line)
                task.updated_at = datetime.now()
                
                # Send the line
                await websocket.send_json({
                    "type": "output",
                    "content": line
                })
            
            # Mark task as completed
            task.status = TaskStatus.COMPLETED
            task.updated_at = datetime.now()
            await websocket.send_json({
                "type": "complete",
                "task_id": task_id
            })
        except Exception as e:
            # Mark task as failed
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.updated_at = datetime.now()
            await websocket.send_json({
                "type": "error",
                "content": f"Error: {str(e)}"
            })
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "content": f"Error: {str(e)}"
            })
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5400, reload=True)