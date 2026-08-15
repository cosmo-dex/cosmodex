Write-Output '=== node processes ==='
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
  $cmd = $_.CommandLine
  if ($cmd.Length -gt 180) { $cmd = $cmd.Substring(0, 180) }
  Write-Output ("pid={0} ppid={1} cmd={2}" -f $_.ProcessId, $_.ParentProcessId, $cmd)
}
Write-Output '=== port 3000 ==='
netstat -ano | Select-String 'LISTENING' | Select-String ':3000 '
Write-Output '=== log ==='
$log = 'C:\Users\Lenovo\Downloads\cosmodex-main222\.freebuff\preview-18e28fcb-79b7-4e45-b565-8edb9a688510.log'
$err = $log + '.err'
Get-Content $log -ErrorAction SilentlyContinue | Select-Object -Last 25
Write-Output '=== err ==='
Get-Content $err -ErrorAction SilentlyContinue | Select-Object -Last 25
