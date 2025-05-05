# OpenManus Desktop GUI

A user-friendly Windows desktop application for the [OpenManus](https://github.com/FoundationAgents/OpenManus) project, designed for non-technical users who want to interact with OpenManus without using the command line.

![OpenManus GUI Screenshot](https://via.placeholder.com/800x600.png?text=OpenManus+GUI)

## 🚀 Quick Start for End Users

### Option 1: Installer (Recommended)

1. Download `OpenManusGUI_Setup.exe` from the [Releases](https://github.com/yourusername/OpenManusGUI/releases) page
2. Run the installer and follow the on-screen instructions
3. Launch OpenManus GUI from the Start menu or desktop shortcut

### Option 2: Portable EXE

1. Download `openmanus_gui.exe` from the [Releases](https://github.com/yourusername/OpenManusGUI/releases) page
2. Create a folder where you want to run the application
3. Double-click the EXE to launch

### Option 3: From Source (For Developers)

1. Make sure you have Python 3.9+ installed on your Windows system
2. Clone both repositories side by side:
   ```
   git clone https://github.com/FoundationAgents/OpenManus.git
   git clone https://github.com/yourusername/OpenManusGUI.git
   ```
3. Run the setup script:
   ```
   cd OpenManusGUI
   setup.cmd
   ```
4. Launch the GUI:
   ```
   .\.venv\Scripts\activate
   python gui.py
   ```

## ✨ Features

- **Simple Interface**: Clean, intuitive design for non-technical users
- **Real-time Output**: See OpenManus responses as they're generated
- **Automatic Logging**: All interactions are saved in dated log files
- **Dark Theme**: Easy on the eyes for extended use
- **Zero Configuration**: Works out of the box with no setup required
- **Standalone Mode**: Bundled executable requires no Python installation

## 🛠️ For Developers

### Building the Standalone Executable

The easiest way is to use the included build script:

1. Activate the virtual environment:
   ```
   .\.venv\Scripts\activate
   ```

2. Run the build script:
   ```
   build.cmd
   ```

This will:
- Install PyInstaller if needed
- Build a single-file executable with OpenManus bundled inside
- Create an installer if Inno Setup is installed

### Manual Build Process

If you prefer to build manually:

1. Install PyInstaller:
   ```
   pip install pyinstaller
   ```

2. Build the executable:
   ```
   pyinstaller --onefile --noconsole ^
     --add-data "..\OpenManus;openmanus" ^
     --name openmanus_gui gui.py
   ```

3. Find the executable in the `dist` folder

### Creating an Installer

1. Install [Inno Setup](https://jrsoftware.org/isinfo.php)
2. Run:
   ```
   iscc openmanus.iss
   ```
3. The installer will be created as `OpenManusGUI_Setup.exe`

## 📁 Project Structure

```
C:\Projects\
 ├─ OpenManus\           ← OpenManus repository (from GitHub)
 └─ OpenManusGUI\        ← This repository
     ├─ gui.py           ← Main application code
     ├─ requirements.txt ← Dependencies (PySimpleGUI)
     ├─ setup.cmd        ← One-click setup script
     ├─ build.cmd        ← Build automation script
     ├─ openmanus.iss    ← Inno Setup installer script
     ├─ README.md        ← Documentation
     └─ logs\            ← Interaction logs (created at runtime)
```

## 📋 Requirements

- **Operating System**: Windows 10/11 (64-bit)
- **For Development**: Python 3.9+
- **For End Users**: No requirements (standalone EXE)

## 🔍 Troubleshooting

### Common Issues

1. **"OpenManus directory not found" error**
   - Make sure the OpenManus repository is cloned as a sibling folder to OpenManusGUI
   - The folder structure should match the one shown in "Project Structure"

2. **"Failed to install dependencies" during setup**
   - Make sure you have internet access
   - Try running the setup script as administrator

3. **No response from OpenManus**
   - Check if OpenManus works directly from command line
   - Ensure all dependencies are installed correctly

### Logs

- All interactions are logged in the `logs` folder with the date as filename
- Check these logs for troubleshooting issues with OpenManus responses

## 📄 License

This project is licensed under the same license as OpenManus.

## 🙏 Acknowledgements

- [OpenManus Project](https://github.com/FoundationAgents/OpenManus) for the core functionality
- [PySimpleGUI](https://pysimplegui.readthedocs.io/) for the GUI framework