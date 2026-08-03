<#
    bump-cache.ps1
    Rewrites the ?v=YYYYMMDD-N cache-busting stamp on every local
    CSS/JS reference across all HTML files in the repo.

    The site has no build step, so asset URLs are versioned by hand
    to force Cloudflare and browsers to pick up changes. Doing that
    across 8 pages x 6 stylesheets by hand is where mistakes live -
    run this instead, after changing anything in css/ or *.js.

    Usage:
      .\.claude\bump-cache.ps1              # stamp = today, revision 1
      .\.claude\bump-cache.ps1 -Revision 2  # second release same day
      .\.claude\bump-cache.ps1 -WhatIf      # show changes, write nothing
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [int]$Revision = 1,
    [string]$Date = (Get-Date -Format 'yyyyMMdd')
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$stamp = "$Date-$Revision"

# Matches href/src="<local .css or .js>?v=<anything>" and captures the path
$pattern = '(?<attr>(?:href|src)\s*=\s*")(?<path>(?!https?:)[^"?]+\.(?:css|js))(?:\?v=[^"]*)?(?<tail>")'

$files = Get-ChildItem -Path $root -Filter '*.html' -File
if (-not $files) { throw "No HTML files found in $root" }

$touched = 0
$refs = 0

foreach ($file in $files) {
    $original = [IO.File]::ReadAllText($file.FullName)

    # Count first, then replace. Incrementing a counter from inside the
    # MatchEvaluator scriptblock does not reliably reach this scope.
    $count = [regex]::Matches($original, $pattern).Count

    $updated = [regex]::Replace($original, $pattern,
        '${attr}${path}?v=' + $stamp + '${tail}')

    if ($updated -ne $original) {
        if ($PSCmdlet.ShouldProcess($file.Name, "stamp $count asset reference(s) with ?v=$stamp")) {
            [IO.File]::WriteAllText($file.FullName, $updated, (New-Object System.Text.UTF8Encoding($false)))
        }
        $touched++
        $refs += $count
        Write-Host ("  {0,-32} {1} reference(s)" -f $file.Name, $count)
    }
}

Write-Host ""
Write-Host "Stamped ?v=$stamp on $refs reference(s) across $touched file(s)." -ForegroundColor Green
