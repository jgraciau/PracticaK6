@echo off
REM Ejecuta k6 y genera los reportes en la carpeta resultados
set FECHA=%date:~6,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set FECHA=%FECHA: =0%
set JSON=resultados\resultado.json
set HTML=resultados\reporte_k6.html

k6 run script\automationexercise.js --summary-export=%JSON%
node config\generar_reporte.js

echo Reportes generados en la carpeta resultados.
pause
