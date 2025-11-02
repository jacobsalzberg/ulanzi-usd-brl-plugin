@echo off
echo Sincronizando plugin para UlanziDeck...

set SOURCE=com.ulanzi.usdbrlex.ulanziPlugin
set DEST=C:\Users\jacob\AppData\Roaming\Ulanzi\UlanziDeck\Plugins\com.ulanzi.usdbrlex.ulanziPlugin

echo Copiando arquivos...
xcopy /Y /E /I "%SOURCE%" "%DEST%"

echo.
echo ✅ Plugin sincronizado com sucesso!
echo Agora recarregue a pagina app.html no navegador.
pause
