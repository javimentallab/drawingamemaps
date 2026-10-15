# Lanzador de la tarea programada "drawingamemaps vigilante" (semanal).
# Se ejecuta oculto (-WindowStyle Hidden en el propio powershell, ver nota de terminal-handoff).
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
& node vigilante.js *>> (Join-Path $PSScriptRoot 'vigilante.log')
