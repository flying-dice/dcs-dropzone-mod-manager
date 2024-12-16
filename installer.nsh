# Scripting Reference: http://nsis.sourceforge.net/Docs/Chapter4.html

!macro customUnInstall
  # Path to the batch file that contains commands to delete symlinks
  Var /GLOBAL BatchFilePath
  StrCpy $BatchFilePath "$APPDATA\dcs-dropzone\mods\del-symlinks.bat"

  # Check if the batch file exists before attempting to execute it
  IfFileExists $BatchFilePath 0 +3
    ExecWait '"$BatchFilePath"'

  # Cleanup other files and directories
  Delete "$LOCALAPPDATA\dcs-dropzone\*.*"
  Delete "$LOCALAPPDATA\dcs-dropzone-updater\*.*"
  RMDir /r "$LOCALAPPDATA\dcs-dropzone"
  RMDir /r "$LOCALAPPDATA\dcs-dropzone-updater"

  # Remove the ProtocolHandler registry key HKEY_CURRENT_USER\Software\Classes\dropzone
  DeleteRegKey HKCU "Software\Classes\dropzone"
!macroend
