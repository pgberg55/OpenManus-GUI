#define MyAppName "OpenManus GUI"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "OpenManus Project"
#define MyAppURL "https://github.com/FoundationAgents/OpenManus"
#define MyAppExeName "openmanus_gui.exe"

[Setup]
; Basic application information
AppId={{F8A2C53E-9A8D-4E87-A7C3-B95D3F89A6D1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Default installation directory
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Installer appearance and behavior
WizardStyle=modern
WizardResizable=yes
SetupIconFile=
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2
SolidCompression=yes
PrivilegesRequiredOverridesAllowed=dialog

; Create a desktop icon by default
ChangesAssociations=no
ChangesEnvironment=no

; Output filename
OutputDir=.
OutputBaseFilename=OpenManusGUI_Setup

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; Main executable
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

; Create logs directory
Source: "*"; DestDir: "{app}\logs"; Flags: ignoreversion createallsubdirs recursesubdirs; Excludes: "*"; Check: not DirExists('{app}\logs')

; License and documentation
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme; Check: FileExists('README.md')

[Icons]
; Start menu and desktop shortcuts
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
; Option to launch after installation
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Check if Python is installed (not strictly necessary for the EXE, but good to know)
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

// Create a custom page to show information about the application
procedure InitializeWizard;
var
  InfoPage: TNewNotebookPage;
  InfoLabel: TLabel;
begin
  InfoPage := WizardForm.PageFromID(wpWelcome);
  
  InfoLabel := TLabel.Create(WizardForm);
  InfoLabel.Parent := InfoPage;
  InfoLabel.Left := WizardForm.WelcomeLabel2.Left;
  InfoLabel.Top := WizardForm.WelcomeLabel2.Top + WizardForm.WelcomeLabel2.Height + 20;
  InfoLabel.Width := WizardForm.WelcomeLabel2.Width;
  InfoLabel.Height := WizardForm.WelcomeLabel2.Height * 2;
  InfoLabel.WordWrap := True;
  InfoLabel.Caption := 'This installer will set up OpenManus GUI, a simple desktop interface for the OpenManus AI assistant.' + #13#10 + #13#10 +
                      'The application is completely self-contained and does not require Python to be installed.';
end;