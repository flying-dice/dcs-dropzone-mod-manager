!macro customUnInstall
  # Path to the batch file that contains commands to delete symlinks
  Var /GLOBAL BatchFilePath
  StrCpy $BatchFilePath "$LOCALAPPDATA\dcs-dropzone\mods\del-symlinks.bat"

  # Check if the batch file exists before attempting to execute it
  IfFileExists $BatchFilePath 0 +3
    ExecWait '"$BatchFilePath"'

  # Cleanup other files and directories
  del /f /q "$LOCALAPPDATA\dcs-dropzone\*.*"
  del /f /q "$LOCALAPPDATA\dcs-dropzone-updater\*.*"
  rmdir /r /q "$LOCALAPPDATA\dcs-dropzone"
  rmdir /r /q "$LOCALAPPDATA\dcs-dropzone-updater"

  # Remove the ProtocolHandler registry key HKEY_CURRENT_USER\Software\Classes\dropzone
  DeleteRegKey HKCU "Software\Classes\dropzone"
!macroend
