param([string]$Destination='C:/r/c4-external-sources-20261004')
$ErrorActionPreference='Stop'
$pins=@(
 @('fhourstones-c','qu1j0t3/fhourstones','bf0e70ed9fe8128eeea8539f17dd41826f2cc6b6'),
 @('pons','PascalPons/connect4','d6ba50d8aaf2308c769d9bf2abd42d90f34baf41'),
 @('christophe','ChristopheSteininger/c4','fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c'),
 @('fhourstones-rust','jesper-olsen/connect-four','aff5861ad4f714059096c6d7c9664477f463766b'),
 @('jsminsys','iteathen/JSMinSys','1b843981ba7d68c118656dad1a6c7591453e7686')
)
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
foreach($p in $pins){
 $path=Join-Path $Destination $p[0]
 if(Test-Path -LiteralPath $path){throw "Use a fresh source destination: $path"}
 & git clone --no-checkout --filter=blob:none "https://github.com/$($p[1]).git" $path
 if($LASTEXITCODE -ne 0){throw 'clone failed'}
 & git -C $path cat-file -t $p[2]
 if($LASTEXITCODE -ne 0){throw 'pinned commit unavailable'}
 # build.mjs uses git show at the pinned commit, never the working checkout.
}
