Add-Type -AssemblyName System.Drawing

$OutputDir = $PSScriptRoot
Write-Host "Les fichiers seront créés dans : $OutputDir"

function New-FaviconPNG {
    param($Size, $FileName)
    $Path = Join-Path $OutputDir $FileName
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)

    $margin = [int]($Size * 0.08)
    $borderW = [Math]::Max(1, [int]($Size * 0.045))
    $yellow = [System.Drawing.Color]::FromArgb(255, 231, 200, 22)
    $taupe = [System.Drawing.Color]::FromArgb(255, 166, 161, 138)
    $black = [System.Drawing.Color]::FromArgb(255, 17, 17, 17)

    $x0 = $margin; $y0 = $margin
    $x1 = $Size - $margin; $y1 = $Size - $margin
    $midY = [int](($y0 + $y1) / 2)

    $yellowBrush = New-Object System.Drawing.SolidBrush $yellow
    $taupeBrush = New-Object System.Drawing.SolidBrush $taupe
    $blackPen = New-Object System.Drawing.Pen $black, $borderW

    $g.FillRectangle($yellowBrush, $x0, $y0, ($x1-$x0), ($midY-$y0))
    $g.FillRectangle($taupeBrush, $x0, $midY, ($x1-$x0), ($y1-$midY))
    $g.DrawRectangle($blackPen, $x0, $y0, ($x1-$x0), ($y1-$y0))
    $g.DrawLine($blackPen, $x0, $midY, $x1, $midY)

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Créé : $Path"
}

$sizes = @{
    "favicon-16x16.png"    = 16
    "favicon-32x32.png"    = 32
    "favicon-48x48.png"    = 48
    "apple-touch-icon.png" = 180
    "icon-192.png"         = 192
    "icon-512.png"         = 512
}

foreach ($name in $sizes.Keys) {
    New-FaviconPNG -Size $sizes[$name] -FileName $name
}