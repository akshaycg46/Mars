$ErrorActionPreference = 'Stop'
$JigyasaNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $JigyasaNode) { throw 'Node.js 24 or newer is needed to start Jigyasa.' }
Push-Location (Join-Path $PSScriptRoot 'next')
try { & $JigyasaNode.Source server.mjs } finally { Pop-Location }

