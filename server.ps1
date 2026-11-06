# ==============================================================================
# Portofolio Backend Server (PowerShell TcpListener HTTP Server)
# Zero external dependencies - runs natively on Windows
# ==============================================================================

$Port = 3000
$RootPath = $PSScriptRoot
if (-not $RootPath) { $RootPath = (Get-Location).Path }

$DataFile = Join-Path $RootPath "data\portfolio.json"
$UploadsDir = Join-Path $RootPath "uploads"

if (-not (Test-Path $UploadsDir)) {
    New-Item -ItemType Directory -Path $UploadsDir -Force | Out-Null
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".gif"  = "image/gif"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".pdf"  = "application/pdf"
}

$PortsToTry = @(3000, 3001, 3002, 3003, 8080, 8081, 8888)
$Listener = $null
$Bound = $false

foreach ($CandidatePort in $PortsToTry) {
    try {
        $Listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $CandidatePort)
        $Listener.Start()
        $Port = $CandidatePort
        $Bound = $true
        break
    } catch {
        if ($Listener) {
            try { $Listener.Stop() } catch {}
        }
    }
}

if (-not $Bound) {
    Write-Host "[ERROR] Tidak dapat menemukan port yang kosong di antara: $($PortsToTry -join ', ')." -ForegroundColor Red
    Write-Host "Silakan tutup aplikasi lain yang sedang menggunakan port tersebut atau coba lagi." -ForegroundColor Yellow
    exit 1
}

try {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [PORTOFOLIO BACKEND SERVER BERJALAN]" -ForegroundColor Green
    Write-Host " URL: http://localhost:$Port" -ForegroundColor Yellow
    Write-Host " Akses portofolio Anda di browser: http://localhost:$Port" -ForegroundColor White
    Write-Host " Membuka browser secara otomatis..." -ForegroundColor Gray
    Write-Host " Tekan CTRL+C di jendela ini untuk menghentikan server." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan

    # Buka browser secara otomatis setelah server siap
    try {
        Start-Process "http://localhost:$Port"
    } catch {
        # Abaikan jika ada pembatasan sistem
    }

    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        $Stream = $Client.GetStream()
        $Stream.ReadTimeout = 5000

        try {
            $Buffer = New-Object byte[] 65536
            $BytesRead = 0
            $RawData = New-Object System.IO.MemoryStream

            do {
                $ChunkRead = $Stream.Read($Buffer, 0, $Buffer.Length)
                if ($ChunkRead -gt 0) {
                    $RawData.Write($Buffer, 0, $ChunkRead)
                    $BytesRead += $ChunkRead
                }
            } while ($Stream.DataAvailable -and $ChunkRead -gt 0)

            $RequestBytes = $RawData.ToArray()
            $RequestString = [System.Text.Encoding]::UTF8.GetString($RequestBytes)

            if ([string]::IsNullOrWhiteSpace($RequestString)) {
                $Client.Close()
                continue
            }

            # Parse HTTP Request line
            $Lines = $RequestString -split "`r`n"
            $RequestLine = $Lines[0]
            $Parts = $RequestLine -split " "
            $Method = $Parts[0].ToUpper()
            $RawUrl = if ($Parts.Length -gt 1) { $Parts[1] } else { "/" }
            $UrlPath = ($RawUrl -split "\?")[0]

            # Headers and Body separation
            $HeaderEndIndex = $RequestString.IndexOf("`r`n`r`n")
            $Body = ""
            if ($HeaderEndIndex -ge 0) {
                $Body = $RequestString.Substring($HeaderEndIndex + 4)
            }

            # Handle CORS preflight
            if ($Method -eq "OPTIONS") {
                $ResponseText = "HTTP/1.1 204 No Content`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nContent-Length: 0`r`n`r`n"
                $ResponseBytes = [System.Text.Encoding]::UTF8.GetBytes($ResponseText)
                $Stream.Write($ResponseBytes, 0, $ResponseBytes.Length)
                $Stream.Flush()
                $Client.Close()
                continue
            }

            # -----------------------------------------------------------
            # API Endpoints
            # -----------------------------------------------------------
            if ($UrlPath -eq "/api/health") {
                $Payload = '{"status":"ok","server":"PowerShell Backend","time":"' + (Get-Date).ToString("o") + '"}'
                $PayloadBytes = [System.Text.Encoding]::UTF8.GetBytes($Payload)
                $Header = "HTTP/1.1 200 OK`r`nContent-Type: application/json`r`nAccess-Control-Allow-Origin: *`r`nContent-Length: $($PayloadBytes.Length)`r`n`r`n"
                $HeaderBytes = [System.Text.Encoding]::UTF8.GetBytes($Header)
                $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
                $Stream.Write($PayloadBytes, 0, $PayloadBytes.Length)
                $Stream.Flush()
                $Client.Close()
                continue
            }

            if ($UrlPath -eq "/api/data" -and $Method -eq "GET") {
                $JsonContent = if (Test-Path $DataFile) { Get-Content $DataFile -Raw -Encoding UTF8 } else { "{}" }
                $PayloadBytes = [System.Text.Encoding]::UTF8.GetBytes($JsonContent)
                $Header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nAccess-Control-Allow-Origin: *`r`nContent-Length: $($PayloadBytes.Length)`r`n`r`n"
                $HeaderBytes = [System.Text.Encoding]::UTF8.GetBytes($Header)
                $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
                $Stream.Write($PayloadBytes, 0, $PayloadBytes.Length)
                $Stream.Flush()
                $Client.Close()
                continue
            }

            if ($UrlPath -eq "/api/data" -and $Method -eq "POST") {
                if (-not [string]::IsNullOrWhiteSpace($Body)) {
                    # Validate JSON
                    try {
                        $Parsed = $Body | ConvertFrom-Json
                        [System.IO.File]::WriteAllText($DataFile, $Body, [System.Text.Encoding]::UTF8)
                        $Result = '{"success":true,"message":"Data portofolio berhasil disimpan secara persisten."}'
                        $StatusCode = "200 OK"
                    } catch {
                        $Result = '{"success":false,"message":"Format JSON tidak valid: ' + $_.Exception.Message.Replace('"', '\"') + '"}'
                        $StatusCode = "400 Bad Request"
                    }
                } else {
                    $Result = '{"success":false,"message":"Body data kosong."}'
                    $StatusCode = "400 Bad Request"
                }

                $PayloadBytes = [System.Text.Encoding]::UTF8.GetBytes($Result)
                $Header = "HTTP/1.1 $StatusCode`r`nContent-Type: application/json; charset=utf-8`r`nAccess-Control-Allow-Origin: *`r`nContent-Length: $($PayloadBytes.Length)`r`n`r`n"
                $HeaderBytes = [System.Text.Encoding]::UTF8.GetBytes($Header)
                $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
                $Stream.Write($PayloadBytes, 0, $PayloadBytes.Length)
                $Stream.Flush()
                $Client.Close()
                continue
            }

            if ($UrlPath -eq "/api/upload" -and $Method -eq "POST") {
                # Supports JSON payload with Base64 image
                $UploadSuccess = $false
                $SavedFilePath = ""
                $ErrorMessage = ""

                try {
                    $UploadData = $Body | ConvertFrom-Json
                    $FileName = $UploadData.filename
                    $Base64Data = $UploadData.data

                    if ([string]::IsNullOrWhiteSpace($FileName) -or [string]::IsNullOrWhiteSpace($Base64Data)) {
                        throw "Field 'filename' dan 'data' (base64) wajib diisi."
                    }

                    # Sanitize filename
                    $SafeFileName = [System.IO.Path]::GetFileNameWithoutExtension($FileName) -replace '[^a-zA-Z0-9_\-]', '_'
                    $Extension = [System.IO.Path]::GetExtension($FileName).ToLower()
                    if ($Extension -notmatch '^\.(jpg|jpeg|png|gif|webp|svg|pdf)$') {
                        $Extension = ".png"
                    }
                    $Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
                    $FinalName = "${SafeFileName}_${Timestamp}${Extension}"
                    $DestinationPath = Join-Path $UploadsDir $FinalName

                    # Strip data URI header if present
                    if ($Base64Data -match '^data:([^;]+);base64,(.+)$') {
                        $Base64Clean = $Matches[2]
                    } else {
                        $Base64Clean = $Base64Data
                    }

                    $FileBytes = [System.Convert]::FromBase64String($Base64Clean)
                    [System.IO.File]::WriteAllBytes($DestinationPath, $FileBytes)
                    $SavedFilePath = "/uploads/$FinalName"
                    $UploadSuccess = $true
                } catch {
                    $ErrorMessage = $_.Exception.Message
                }

                if ($UploadSuccess) {
                    $Result = '{"success":true,"url":"' + $SavedFilePath + '","message":"Foto berhasil diunggah ke server."}'
                    $StatusCode = "200 OK"
                } else {
                    $Result = '{"success":false,"message":"Gagal mengunggah foto: ' + $ErrorMessage.Replace('"', '\"') + '"}'
                    $StatusCode = "400 Bad Request"
                }

                $PayloadBytes = [System.Text.Encoding]::UTF8.GetBytes($Result)
                $Header = "HTTP/1.1 $StatusCode`r`nContent-Type: application/json; charset=utf-8`r`nAccess-Control-Allow-Origin: *`r`nContent-Length: $($PayloadBytes.Length)`r`n`r`n"
                $HeaderBytes = [System.Text.Encoding]::UTF8.GetBytes($Header)
                $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
                $Stream.Write($PayloadBytes, 0, $PayloadBytes.Length)
                $Stream.Flush()
                $Client.Close()
                continue
            }

            # -----------------------------------------------------------
            # Static File Serving & Admin Route
            # -----------------------------------------------------------
            $RelativePath = $UrlPath.TrimStart('/').Replace('/', '\')
            if ([string]::IsNullOrWhiteSpace($RelativePath)) {
                $RelativePath = "index.html"
            }
            if ($UrlPath -eq "/admin" -or $UrlPath -eq "/admin/" -or $UrlPath -eq "/cms") {
                $RelativePath = "admin.html"
            }

            $LocalFilePath = Join-Path $RootPath $RelativePath

            if (Test-Path $LocalFilePath -PathType Leaf) {
                $Extension = [System.IO.Path]::GetExtension($LocalFilePath).ToLower()
                $ContentType = if ($MimeTypes.ContainsKey($Extension)) { $MimeTypes[$Extension] } else { "application/octet-stream" }
                $FileBytes = [System.IO.File]::ReadAllBytes($LocalFilePath)

                $Header = "HTTP/1.1 200 OK`r`nContent-Type: $ContentType`r`nAccess-Control-Allow-Origin: *`r`nContent-Length: $($FileBytes.Length)`r`n`r`n"
                $HeaderBytes = [System.Text.Encoding]::UTF8.GetBytes($Header)
                $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
                $Stream.Write($FileBytes, 0, $FileBytes.Length)
            } else {
                $NotFoundText = "<html><body><h1>404 Not Found</h1><p>File $UrlPath tidak ditemukan pada server.</p></body></html>"
                $NotFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($NotFoundText)
                $Header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($NotFoundBytes.Length)`r`n`r`n"
                $HeaderBytes = [System.Text.Encoding]::UTF8.GetBytes($Header)
                $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
                $Stream.Write($NotFoundBytes, 0, $NotFoundBytes.Length)
            }

            $Stream.Flush()
            $Client.Close()
        } catch {
            if ($Client.Connected) {
                $Client.Close()
            }
        }
    }
} finally {
    if ($Bound -and $Listener) {
        try { $Listener.Stop() } catch {}
        Write-Host "Server telah dihentikan." -ForegroundColor Yellow
    }
}

