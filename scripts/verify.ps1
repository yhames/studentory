[CmdletBinding()]
param(
    [switch]$Install,
    [ValidateSet("all", "backend", "frontend")]
    [string]$Scope = "all"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Invoke-Check {
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [Parameter(Mandatory)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory)]
        [scriptblock]$Command
    )

    Write-Host "`n==> $Name"
    Push-Location $WorkingDirectory
    try {
        & $Command
        if ($LASTEXITCODE -ne 0) {
            $script:failures.Add("$Name (exit $LASTEXITCODE)")
        }
    }
    catch {
        $script:failures.Add("$Name ($($_.Exception.Message))")
    }
    finally {
        Pop-Location
    }
}

function Invoke-BackendTool {
    param(
        [Parameter(Mandatory)]
        [string]$Tool,
        [string[]]$Arguments = @()
    )

    if (Get-Command uv -ErrorAction SilentlyContinue) {
        & uv run $Tool @Arguments
        return
    }

    $executable = Join-Path $repositoryRoot "backend\.venv\Scripts\$Tool.exe"
    if (-not (Test-Path $executable)) {
        throw "Neither uv nor $executable is available. Run scripts/verify.ps1 -Install after installing uv."
    }
    & $executable @Arguments
}

if ($Scope -in @("all", "backend")) {
    $backendPath = Join-Path $repositoryRoot "backend"
    if ($Install) {
        Invoke-Check "Backend dependency sync" $backendPath { uv sync }
    }
    Invoke-Check "Backend Ruff" $backendPath { Invoke-BackendTool "ruff" @("check", ".") }
    Invoke-Check "Backend Pyright" $backendPath { Invoke-BackendTool "pyright" }
    Invoke-Check "Backend pytest" $backendPath { Invoke-BackendTool "pytest" }
}

if ($Scope -in @("all", "frontend")) {
    $frontendPath = Join-Path $repositoryRoot "frontend"
    if ($Install) {
        Invoke-Check "Frontend dependency install" $frontendPath { pnpm install --frozen-lockfile }
    }
    Invoke-Check "Frontend lint" $frontendPath { pnpm lint }
    Invoke-Check "Frontend build" $frontendPath { pnpm build }
}

if ($failures.Count -gt 0) {
    Write-Host "`nVerification failed:"
    $failures | ForEach-Object { Write-Host "- $_" }
    exit 1
}

Write-Host "`nAll selected checks passed."
