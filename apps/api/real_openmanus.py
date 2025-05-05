"""
Integration with the real OpenManus agent.
"""
import asyncio
from typing import AsyncGenerator
import sys
import os

# Try to import OpenManus
try:
    import openmanus
except ImportError:
    print("OpenManus package not found. Please install it with 'pip install openmanus'")
    # Don't exit, just raise the ImportError to be caught by the caller
    raise

async def run_openmanus(prompt: str) -> AsyncGenerator[str, None]:
    """
    Run the real OpenManus agent with the given prompt.
    Yields output lines as they are generated.
    """
    try:
        # Initialize the OpenManus agent
        agent = openmanus.Agent()
        
        # Run the agent with the prompt
        # This is an example - adjust based on the actual OpenManus API
        result_generator = agent.run(prompt)
        
        # Yield output lines as they are generated
        for line in result_generator:
            yield line
            # Add a small delay to simulate streaming
            await asyncio.sleep(0.05)
            
    except Exception as e:
        yield f"Error running OpenManus: {str(e)}"
        raise