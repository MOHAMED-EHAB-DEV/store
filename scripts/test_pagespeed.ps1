param (
    [ValidateSet("Brave", "Chrome")]
    [string]$Browser = "Brave"
)

# Script to open PageSpeed Insights for multiple URLs in Private/Incognito Tabs

$urls = @(
    "https://mhd-store.vercel.app/",
    "https://mhd-store.vercel.app/custom-development",
    "https://mhd-store.vercel.app/templates",
    "https://mhd-store.vercel.app/templates/category/vite",
    "https://mhd-store.vercel.app/templates/aura-studio",
    "https://mhd-store.vercel.app/blog",
    "https://mhd-store.vercel.app/blog/nextjs-pagespeed-score-100-real-fixes",
    "https://mhd-store.vercel.app/faqs",
    "https://mhd-store.vercel.app/login",
    "https://mhd-store.vercel.app/register",
    "https://mhd-store.vercel.app/pricing",
    "https://mhd-store.vercel.app/support"
)

$browserPath = $null

if ($Browser -eq "Brave") {
    $paths = @(
        "${env:ProgramFiles}\BraveSoftware\Brave-Browser\Application\brave.exe",
        "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
        "$env:LocalAppData\BraveSoftware\Brave-Browser\Application\brave.exe"
    )
} else {
    $paths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
    )
}

foreach ($path in $paths) {
    if (Test-Path $path) {
        $browserPath = $path
        break
    }
}

if (-not $browserPath) {
    Write-Error "$Browser Browser not found. Please ensure it is installed."
    exit
}

Write-Host "Opening PageSpeed Insights in $Browser (Incognito Mode)..." -ForegroundColor Cyan

foreach ($url in $urls) {
    $psiUrl = "https://pagespeed.web.dev/analysis?url=$url"
    Write-Host "Processing: $url" -ForegroundColor Gray
    
    Start-Process $browserPath -ArgumentList "--incognito", $psiUrl
    
    # Small delay to prevent issues with multiple process starts
    Start-Sleep -Milliseconds 500
}

Write-Host "Success! Check your $Browser window." -ForegroundColor Green
