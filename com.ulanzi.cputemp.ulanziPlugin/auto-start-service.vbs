' USD/BRL Exchange Rate Plugin - Silent Auto-Start Service
' This VBS script starts the plugin service silently without showing windows

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strPluginPath = strScriptPath & "\plugin\app.html"

' Check if the plugin file exists
If objFSO.FileExists(strPluginPath) Then
    ' Start the plugin service silently in the background
    objShell.Run """" & strPluginPath & """", 0, False
Else
    ' Log error if plugin file not found
    objShell.LogEvent 1, "USD/BRL Plugin: app.html not found at " & strPluginPath
End If

Set objShell = Nothing
Set objFSO = Nothing