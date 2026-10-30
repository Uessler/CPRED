$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$source = Join-Path $projectRoot 'src'
$dist = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Path $dist -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$version = (Get-Content (Join-Path $source 'library.json') -Raw | ConvertFrom-Json).version
$output = Join-Path $dist "sexored-$version.mtlib"
$stream = [IO.File]::Open($output, [IO.FileMode]::Create)
$archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -LiteralPath $source -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($source.Length + 1).Replace('\','/')
    # JavaFX caches resources by URI, including when an add-on is replaced.
    # Version all UI entry points so updates work inside a running MapTool.
    $uiFiles = @('index.html','style.css','model.js','tokens.js','portraits.js','market-data.js','market-ui.js','app.js')
    $isUi = $relative.StartsWith('library/public/') -and $_.Name -in $uiFiles
    if ($isUi -or $relative -eq 'library/mtscript/public/open.mts') {
      $content = [IO.File]::ReadAllText($_.FullName)
      if ($_.Name -eq 'index.html' -or $_.Name -eq 'open.mts') {
        foreach ($uiFile in $uiFiles) {
          $newName = [IO.Path]::GetFileNameWithoutExtension($uiFile) + '-' + $version + [IO.Path]::GetExtension($uiFile)
          $content = $content.Replace($uiFile, $newName)
        }
      }
      if ($isUi) {
        $relative = 'library/public/' + $_.BaseName + '-' + $version + $_.Extension
      }
      $entry = $archive.CreateEntry($relative, [IO.Compression.CompressionLevel]::Optimal)
      $writer = [IO.StreamWriter]::new($entry.Open(), [Text.UTF8Encoding]::new($false))
      $writer.Write($content); $writer.Dispose()
    } else {
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
} finally { $archive.Dispose(); $stream.Dispose() }
Write-Output "Gerado: $output"
