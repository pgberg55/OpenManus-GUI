import PySimpleGUI as sg
import subprocess, sys, os, pathlib, threading, time, traceback
from datetime import datetime
import shutil

# ---------- paths ----------
BASE_DIR = pathlib.Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"
VERSION = "1.0.0"

# Ensure logs directory exists
LOGS_DIR.mkdir(exist_ok=True)

def find_openmanus_dir():
    """Find the OpenManus directory by checking common locations"""
    # Check sibling directory first (standard setup)
    sibling_dir = BASE_DIR.parent / "OpenManus"
    if sibling_dir.exists() and (sibling_dir / "run_mcp.py").exists():
        return sibling_dir
    
    # Check if we're running from a PyInstaller bundle
    if getattr(sys, 'frozen', False):
        # When bundled with PyInstaller, OpenManus should be in the 'openmanus' subdirectory
        bundled_dir = pathlib.Path(sys._MEIPASS) / "openmanus"
        if bundled_dir.exists():
            return bundled_dir
    
    # Check current directory as fallback
    if (BASE_DIR / "openmanus").exists() and (BASE_DIR / "openmanus" / "run_mcp.py").exists():
        return BASE_DIR / "openmanus"
    
    # Last resort - ask user
    sg.popup_error("OpenManus directory not found!\n\nPlease make sure the OpenManus repository "
                  "is cloned as a sibling folder to OpenManusGUI.", title="Error")
    return None

# Find OpenManus directory
OPENMANUS_DIR = find_openmanus_dir()
PYTHON_EXE = sys.executable  # current interpreter

def run_openmanus_thread(prompt, window):
    """Run OpenManus in a separate thread to keep GUI responsive"""
    try:
        if not OPENMANUS_DIR:
            window.write_event_value('-THREAD-', "ERROR: OpenManus directory not found!")
            return
        
        # Determine which script to use
        if (OPENMANUS_DIR / "main.py").exists():
            script = OPENMANUS_DIR / "main.py"
        else:
            script = OPENMANUS_DIR / "run_mcp.py"
        
        # Build command
        cmd = [PYTHON_EXE, str(script), "--prompt", prompt]
        
        # Update GUI to show we're running
        window.write_event_value('-THREAD-', "Starting OpenManus...\n")
        
        # Run the process
        process = subprocess.Popen(
            cmd,
            cwd=OPENMANUS_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Stream output in real-time
        output = []
        for line in process.stdout:
            output.append(line)
            window.write_event_value('-THREAD-', line)
        
        # Get any error output
        stderr_output = process.stderr.read()
        if stderr_output:
            window.write_event_value('-THREAD-', f"\nERROR OUTPUT:\n{stderr_output}")
            output.append(stderr_output)
        
        # Wait for process to complete
        process.wait()
        
        # Log the interaction
        full_output = "".join(output)
        log_interaction(prompt, full_output)
        
        # Signal completion
        window.write_event_value('-THREAD-DONE-', "")
        
    except Exception as e:
        error_msg = f"Error running OpenManus: {str(e)}\n{traceback.format_exc()}"
        window.write_event_value('-THREAD-', error_msg)
        log_interaction(prompt, error_msg)
        window.write_event_value('-THREAD-DONE-', "")

def log_interaction(prompt, response):
    """Log each prompt/response pair to logs/YYYY-MM-DD.txt"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        log_file = LOGS_DIR / f"{today}.txt"
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"=== PROMPT ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===\n")
            f.write(f"{prompt}\n\n")
            f.write("=== RESPONSE ===\n")
            f.write(f"{response}\n\n")
            f.write("="*80 + "\n\n")
    except Exception as e:
        print(f"Error logging interaction: {e}")

def create_main_window():
    """Create the main application window"""
    sg.theme("DarkPurple6")
    
    menu_def = [
        ['File', ['Open Logs Folder', 'Exit']],
        ['Help', ['About']]
    ]
    
    layout = [
        [sg.Menu(menu_def)],
        [sg.Text("🔮 OpenManus GUI", font=("Helvetica", 16))],
        [sg.Text("Enter your prompt below:")],
        [sg.Multiline(key="PROMPT", size=(80, 10), font=("Consolas", 10))],
        [sg.Button("Run", size=(10, 1)), sg.Button("Clear", size=(10, 1)), 
         sg.Text("", key="STATUS", size=(40, 1))],
        [sg.Text("Output:")],
        [sg.Multiline(key="OUTPUT", size=(80, 15), disabled=True, 
                     autoscroll=True, font=("Consolas", 10))],
        [sg.ProgressBar(100, orientation='h', size=(50, 20), key='PROGRESS', visible=False)]
    ]
    
    return sg.Window("OpenManus GUI v" + VERSION, layout, finalize=True, 
                    resizable=True, icon=None)

def main():
    """Main application entry point"""
    window = create_main_window()
    window.set_min_size((640, 480))
    
    # Initialize variables
    running = False
    progress_thread = None
    
    # Main event loop
    while True:
        event, values = window.read(timeout=100)
        
        # Handle window close
        if event in (sg.WIN_CLOSED, 'Exit'):
            break
            
        # Handle menu events
        elif event == 'About':
            sg.popup("OpenManus GUI v" + VERSION, 
                    "A simple desktop interface for OpenManus",
                    "Created for non-technical users",
                    title="About")
                    
        elif event == 'Open Logs Folder':
            try:
                # On Windows, open the folder in Explorer
                if os.name == 'nt':
                    os.startfile(LOGS_DIR)
                else:
                    sg.popup("Logs are stored in:", str(LOGS_DIR))
            except Exception as e:
                sg.popup_error(f"Error opening logs folder: {e}")
        
        # Handle button events
        elif event == "Run" and not running:
            prompt = values["PROMPT"].strip()
            if prompt:
                # Clear output and show progress
                window["OUTPUT"].update("")
                window["STATUS"].update("Running...", text_color="yellow")
                window["PROGRESS"].update(visible=True)
                window.refresh()
                
                # Start processing thread
                running = True
                threading.Thread(target=run_openmanus_thread, 
                                args=(prompt, window), daemon=True).start()
                
                # Start progress animation
                progress_thread = threading.Thread(target=progress_animation, 
                                                 args=(window,), daemon=True)
                progress_thread.start()
                
        elif event == "Clear":
            window["PROMPT"].update("")
            window["OUTPUT"].update("")
            window["STATUS"].update("")
            
        # Handle thread events (output from OpenManus)
        elif event == '-THREAD-':
            current_output = window["OUTPUT"].get()
            window["OUTPUT"].update(current_output + values['-THREAD-'])
            window.refresh()
            
        elif event == '-THREAD-DONE-':
            running = False
            window["STATUS"].update("Completed", text_color="green")
            window["PROGRESS"].update(visible=False)
            window.refresh()

    window.close()

def progress_animation(window):
    """Animate progress bar while processing"""
    progress = 0
    direction = 1
    
    while True:
        # Update progress bar
        window.write_event_value('-PROGRESS-', progress)
        window['PROGRESS'].update(progress)
        
        # Bounce back and forth
        progress += direction * 2
        if progress >= 100:
            direction = -1
        elif progress <= 0:
            direction = 1
            
        time.sleep(0.05)

if __name__ == "__main__":
    main()