# LAN static file server (PowerShell, no Python required)
param([int]$Port = 8080)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Get-LanIp {
    try {
        $socket = New-Object System.Net.Sockets.Socket(
            [System.Net.Sockets.AddressFamily]::InterNetwork,
            [System.Net.Sockets.SocketType]::Dgram,
            [System.Net.Sockets.ProtocolType]::Udp
        )
        $socket.Connect('8.8.8.8', 80)
        $ip = $socket.LocalEndPoint.Address.ToString()
        $socket.Close()
        return $ip
    }
    catch {
        return $null
    }
}

function Get-MimeType([string]$Path) {
    switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.css'  { return 'text/css; charset=utf-8' }
        '.js'   { return 'application/javascript; charset=utf-8' }
        '.svg'  { return 'image/svg+xml' }
        '.png'  { return 'image/png' }
        '.jpg'  { return 'image/jpeg' }
        '.jpeg' { return 'image/jpeg' }
        '.ico'  { return 'image/x-icon' }
        default { return 'application/octet-stream' }
    }
}

function Send-Bytes($Response, [byte[]]$Bytes, [string]$ContentType, [int]$StatusCode = 200) {
    $Response.StatusCode = $StatusCode
    $Response.ContentType = $ContentType
    $Response.ContentLength64 = $Bytes.Length
    $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    $Response.OutputStream.Close()
}

function Send-Text($Response, [string]$Text, [string]$ContentType = 'text/html; charset=utf-8', [int]$StatusCode = 200) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    Send-Bytes $Response $bytes $ContentType $StatusCode
}

function Get-DirectoryListing([string]$DirPath, [string]$UrlPath) {
    $items = Get-ChildItem -LiteralPath $DirPath | Sort-Object { -not $_.PSIsContainer }, Name
    $rows = foreach ($item in $items) {
        $name = $item.Name
        $href = ($UrlPath.TrimEnd('/') + '/' + [Uri]::EscapeDataString($name)).Replace('\', '/')
        if ($item.PSIsContainer) { $href += '/' }
        $label = if ($item.PSIsContainer) { "$name/" } else { $name }
        "      <li><a href=`"$href`">$label</a></li>"
    }
    @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>Index of $UrlPath</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    h1 { font-size: 1.25rem; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>Index of $UrlPath</h1>
  <ul>
$($rows -join "`n")
  </ul>
</body>
</html>
"@
}

function Resolve-RequestPath([string]$LocalPath) {
    $candidate = [IO.Path]::GetFullPath((Join-Path $Root ($LocalPath -replace '/', [IO.Path]::DirectorySeparatorChar)))
    if (-not $candidate.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }
    return $candidate
}

$LanIp = Get-LanIp
$Pages = Get-ChildItem -Path $Root -Filter '*.html' |
    Where-Object { $_.Name -ne 'index.html' } |
    Sort-Object Name |
    ForEach-Object { $_.Name }

Write-Host ''
Write-Host ('=' * 56)
Write-Host '  LumiSport - LAN preview server'
Write-Host ('=' * 56)
Write-Host ''
Write-Host "  Local:   http://127.0.0.1:$Port/"
if ($LanIp) {
    Write-Host "  LAN:     http://${LanIp}:$Port/"
}
else {
    Write-Host '  LAN:     (run ipconfig to find your IPv4 address)'
}
Write-Host ''
if ($Pages) {
    Write-Host '  Pages:'
    foreach ($page in $Pages) {
        Write-Host "    - http://127.0.0.1:$Port/$page"
        if ($LanIp) {
            Write-Host "      http://${LanIp}:$Port/$page"
        }
    }
}
Write-Host ''
Write-Host '  Other devices on the same network can use the LAN URL above.'
Write-Host '  Allow Windows Firewall if prompted. Press Ctrl+C to stop.'
Write-Host ('=' * 56)
Write-Host ''

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://127.0.0.1:${Port}/")
if ($LanIp) {
    $Listener.Prefixes.Add("http://${LanIp}:${Port}/")
}

$LansOnly = $false
try {
    $Listener.Start()
}
catch {
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add("http://127.0.0.1:${Port}/")
    try {
        $Listener.Start()
        Write-Host "WARNING: LAN bind failed; local access only." -ForegroundColor Yellow
        Write-Host ''
    }
    catch {
        Write-Host "ERROR: Cannot start server on port $Port." -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host 'Port may be in use. Close other programs and try again.'
        exit 1
    }
}

Start-Process "http://127.0.0.1:${Port}/" | Out-Null

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        try {
            $RawPath = [Uri]::UnescapeDataString($Request.Url.LocalPath)
            if ($RawPath -eq '/') { $RawPath = '' }
            $Target = Resolve-RequestPath $RawPath.TrimStart('/')

            if ($null -eq $Target) {
                Send-Text $Response '403 Forbidden' 'text/plain; charset=utf-8' 403
                continue
            }

            if ((Test-Path -LiteralPath $Target -PathType Leaf)) {
                $Bytes = [IO.File]::ReadAllBytes($Target)
                Send-Bytes $Response $Bytes (Get-MimeType $Target)
                continue
            }

            if ((Test-Path -LiteralPath $Target -PathType Container)) {
                $IndexPath = Join-Path $Target 'index.html'
                if (-not $RawPath -or $RawPath -eq '/') {
                    if (Test-Path -LiteralPath $IndexPath -PathType Leaf) {
                        $Bytes = [IO.File]::ReadAllBytes($IndexPath)
                        Send-Bytes $Response $Bytes (Get-MimeType $IndexPath)
                        continue
                    }
                }

                $Listing = Get-DirectoryListing $Target $RawPath
                Send-Text $Response $Listing
                continue
            }

            Send-Text $Response '404 Not Found' 'text/plain; charset=utf-8' 404
        }
        catch {
            try {
                Send-Text $Response '500 Internal Server Error' 'text/plain; charset=utf-8' 500
            }
            catch {
                # response already closed
            }
        }
    }
}
finally {
    if ($Listener.IsListening) {
        $Listener.Stop()
    }
    $Listener.Close()
    Write-Host ''
    Write-Host 'Server stopped.'
}
