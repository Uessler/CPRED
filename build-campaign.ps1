param(
  [string]$Template = (Join-Path $PSScriptRoot 'cpred-framework.cmpgn'),
  [string]$Addon = (Join-Path $PSScriptRoot 'dist/sexored-0.3.1.mtlib'),
  [string]$Output = (Join-Path $PSScriptRoot 'dist/SEXORED-0.3.cmpgn')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
if ([IO.Path]::GetFullPath($Template) -eq [IO.Path]::GetFullPath($Output)) { throw 'O destino deve ser diferente da campanha original.' }
Copy-Item -LiteralPath $Template -Destination $Output -Force
$hash = (Get-FileHash -LiteralPath $Addon -Algorithm MD5).Hash.ToLowerInvariant()
$metadata = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'src/library.json') -Raw | ConvertFrom-Json
$manifest = @{libraries=@(@{details=$metadata;md5Hash=$hash})} | ConvertTo-Json -Depth 8 -Compress
$archive = [IO.Compression.ZipFile]::Open($Output, [IO.Compression.ZipArchiveMode]::Update)
try {
  $contentEntry = $archive.GetEntry('content.xml')
  $reader = [IO.StreamReader]::new($contentEntry.Open())
  [xml]$document = $reader.ReadToEnd(); $reader.Dispose()
  $macroList = $document.SelectSingleNode('//campaign/macroButtonProperties')
  if ($macroList -and -not $macroList.SelectSingleNode('*[label="SEXORED · Ficha"]')) {
    $fragment = $document.CreateDocumentFragment()
    $macroId = [guid]::NewGuid().ToString()
    $fragment.InnerXml = @"
<net.rptools.maptool.model.MacroButtonProperties>
  <macroUUID>$macroId</macroUUID><saveLocation>CampaignPanel</saveLocation><index>1</index>
  <colorKey>red</colorKey><hotKey>None</hotKey>
  <command>[h, macro(&quot;open@lib:local.sexored.red&quot;): &quot;&quot;]</command>
  <label>SEXORED · Ficha</label><group>SEXORED</group><sortby></sortby>
  <autoExecute>true</autoExecute><includeLabel>false</includeLabel><applyToTokens>false</applyToTokens>
  <fontColorKey>white</fontColorKey><fontSize>1.00em</fontSize><minWidth></minWidth><maxWidth></maxWidth>
  <allowPlayerEdits>false</allowPlayerEdits><toolTip>Abrir a ficha SEXORED</toolTip><displayHotKey>true</displayHotKey>
  <commonMacro>false</commonMacro><compareGroup>true</compareGroup><compareSortPrefix>true</compareSortPrefix>
  <compareCommand>true</compareCommand><compareIncludeLabel>true</compareIncludeLabel>
  <compareAutoExecute>true</compareAutoExecute><compareApplyToSelectedTokens>true</compareApplyToSelectedTokens>
</net.rptools.maptool.model.MacroButtonProperties>
"@
    $macroList.AppendChild($fragment) | Out-Null
    $document.SelectSingleNode('//campaign/macroButtonLastIndex').InnerText = '1'
    $contentEntry.Delete()
    $contentEntry = $archive.CreateEntry('content.xml')
    $writer = [IO.StreamWriter]::new($contentEntry.Open(), [Text.UTF8Encoding]::new($false))
    $writer.Write($document.OuterXml); $writer.Dispose()
  }
  $entry = $archive.GetEntry('libraries/libraries.json')
  if ($entry) { $entry.Delete() }
  $entry = $archive.CreateEntry('libraries/libraries.json')
  $writer = [IO.StreamWriter]::new($entry.Open(), [Text.UTF8Encoding]::new($false))
  $writer.Write($manifest); $writer.Dispose()
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $Addon, "libraries/assets/$hash") | Out-Null
} finally { $archive.Dispose() }
Write-Output "Campanha gerada: $Output"
