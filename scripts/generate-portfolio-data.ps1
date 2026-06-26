# Scans assets/img/portfolio/ and generates assets/data/portfolio-data.json
# Re-run this script after adding new portfolio folders or images.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$portfolioDir = Join-Path $root "assets\img\portfolio"
$outDir = Join-Path $root "assets\data"
$outFile = Join-Path $outDir "portfolio-data.json"
$imageExt = '\.(jpg|jpeg|png|webp|gif)$'

if (-not (Test-Path $portfolioDir)) {
    Write-Error "Portfolio directory not found: $portfolioDir"
}

$projects = Get-ChildItem $portfolioDir -Directory | ForEach-Object {
    $imgs = Get-ChildItem $_.FullName -File |
        Where-Object { $_.Name -match $imageExt } |
        Sort-Object Name

    if ($imgs.Count -eq 0) { return }

    [PSCustomObject]@{
        id     = ($_.Name.ToLower() -replace '[^a-z0-9]+', '-' -replace '^-|-$', '')
        name   = $_.Name
        folder = $_.Name
        cover  = "assets/img/portfolio/$($_.Name)/$($imgs[0].Name)"
        count  = $imgs.Count
        images = @($imgs | ForEach-Object { "assets/img/portfolio/$($_.Directory.Name)/$($_.Name)" })
    }
} | Where-Object { $_ -ne $null } | Sort-Object name

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$output = @{
    generatedAt = (Get-Date).ToString("o")
    projects    = @($projects)
}

$output | ConvertTo-Json -Depth 6 | Set-Content -Path $outFile -Encoding UTF8

Write-Host "Generated $($projects.Count) projects -> $outFile"
$projects | Select-Object name, count | Format-Table -AutoSize
