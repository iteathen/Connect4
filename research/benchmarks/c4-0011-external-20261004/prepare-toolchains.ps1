param([string]$Destination='C:/r/c4-external-toolchains-20261004', [string]$SevenZip='C:/Program Files/7-Zip/7z.exe')
$ErrorActionPreference='Stop'
# Portable archives only. No installer script, registry change, or persistent PATH change.
$archives=@(
 @{file='w64devkit-x64-2.10.0.7z.exe';url='https://github.com/skeeto/w64devkit/releases/download/v2.10.0/w64devkit-x64-2.10.0.7z.exe';sha='18d0a4c71a166f8401ab6305781bec5882b40b5e06ba9807c61cb5f3b3c6325e'},
 @{file='rustc.tar.xz';url='https://static.rust-lang.org/dist/rustc-1.90.0-x86_64-pc-windows-gnu.tar.xz';sha='925e67ef4684861eb301d123a45292a63a0afba49060b60e3264f73c7f9cc1ec'},
 @{file='rust-std.tar.xz';url='https://static.rust-lang.org/dist/rust-std-1.90.0-x86_64-pc-windows-gnu.tar.xz';sha='d82b3240908390cef1ddb88d2d922fa6d5e8abb6e6ef1d47948ec503ba694bf5'},
 @{file='rust-mingw.tar.xz';url='https://static.rust-lang.org/dist/rust-mingw-1.90.0-x86_64-pc-windows-gnu.tar.xz';sha='3254c05b7a7f8edc915a78b11dafd5395f9bc94b2c6a24016294470190e1f77c'}
)
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
foreach($a in $archives){
 $path=Join-Path $Destination $a.file
 if(-not(Test-Path -LiteralPath $path)){Invoke-WebRequest $a.url -OutFile $path}
 if((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $a.sha){throw "Archive hash mismatch: $path"}
}
& $SevenZip x (Join-Path $Destination $archives[0].file) "-o$Destination" -y
if($LASTEXITCODE -ne 0){throw 'w64devkit extraction failed'}
foreach($a in $archives | Select-Object -Skip 1){ & tar -xf (Join-Path $Destination $a.file) -C $Destination; if($LASTEXITCODE -ne 0){throw 'Rust extraction failed'} }
$rustRoot=Join-Path $Destination 'rust'
New-Item -ItemType Directory -Force -Path $rustRoot | Out-Null
foreach($component in @('rustc','rust-std','rust-mingw')){
 $inner=if($component -eq 'rust-std'){'rust-std-x86_64-pc-windows-gnu'}else{$component}
 Copy-Item (Join-Path $Destination "$component-1.90.0-x86_64-pc-windows-gnu/$inner/*") $rustRoot -Recurse -Force
}
$archives | ConvertTo-Json | Set-Content (Join-Path $Destination 'archive-lock.json') -Encoding utf8
