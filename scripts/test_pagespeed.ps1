# Script to open PageSpeed Insights for multiple URLs in Brave Private Tabs

$urls = @(
    # "https://mhd-store.vercel.app/",
    # "https://mhd-store.vercel.app/templates",
    # "https://mhd-store.vercel.app/templates/category/vite",
    "https://mhd-store.vercel.app/templates/obsidian-portfolio",
    "https://mhd-store-test.vercel.app/templates/obsidian-portfolio",
    "https://mhd-store-test.vercel.app/blog/stop-manual-deploys-github-actions-for-web-devs",
    "https://mhd-store.vercel.app/blog/stop-manual-deploys-github-actions-for-web-devs"
    # "https://mhd-store.vercel.app/test",
)

# Detect Brave path (standard locations)
$bravePaths = @(
    "${env:ProgramFiles}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:LocalAppData\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$bravePath = $null
foreach ($path in $bravePaths) {
    if (Test-Path $path) {
        $bravePath = $path
        break
    }
}

if (-not $bravePath) {
    Write-Error "Brave Browser not found. Please ensure it is installed."
    exit
}

Write-Host "Opening PageSpeed Insights in Brave (Private Mode)..." -ForegroundColor Cyan

foreach ($url in $urls) {
    $psiUrl = "https://pagespeed.web.dev/analysis?url=$url"
    Write-Host "Processing: $url" -ForegroundColor Gray
    
    # Open 2 tabs for each URL
    Start-Process $bravePath -ArgumentList "--incognito", $psiUrl
    Start-Process $bravePath -ArgumentList "--incognito", $psiUrl
    
    # Small delay to prevent issues with multiple process starts
    Start-Sleep -Milliseconds 500
}

Write-Host "Success! Check your Brave window." -ForegroundColor Green
