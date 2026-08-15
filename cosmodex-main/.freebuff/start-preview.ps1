$ErrorActionPreference = 'Continue'

# Project root is the cosmodex-main SUBFOLDER inside the thread workspace
$root = 'C:\Users\Lenovo\Downloads\cosmodex-main222\cosmodex-main'
$log  = 'C:\Users\Lenovo\Downloads\cosmodex-main222\.freebuff\preview-18e28fcb-79b7-4e45-b565-8edb9a688510.log'
$err  = $log + '.err'

Remove-Item $log, $err -ErrorAction SilentlyContinue

# Override the harness's leaked PORT env so the child binds 3000.
$env:PORT = '3000'

$p = Start-Process -FilePath 'node.exe' `
  -ArgumentList 'node_modules/next/dist/bin/next','dev','-p','3000' `
  -WorkingDirectory $root `
  -RedirectStandardOutput $log `
  -RedirectStandardError $err `
  -WindowStyle Hidden `
  -PassThru

Start-Sleep -Seconds 12

$alive = Get-Process -Id $p.Id -ErrorAction SilentlyContinue
if ($alive) {
  Write-Output ("ALIVE pid={0}" -f $p.Id)
} else {
  Write-Output ("DEAD pid={0}" -f $p.Id)
}
Write-Output '---STDOUT---'
Get-Content $log -ErrorAction SilentlyContinue
Write-Output '---STDERR---'
Get-Content $err -ErrorAction SilentlyContinue
