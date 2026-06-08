# Deploy para HostGator via FTP
# PowerShell Script para Windows

Write-Host "=== DEPLOY SOLAR BUY-SIDE v2 ===" -ForegroundColor Green
Write-Host ""

# Configurações (PREENCHER)
$FTP_HOST = "ftp.solarbuyside.com.br"
$FTP_USER = "seu-usuario-ftp"  # ALTERE AQUI
$FTP_PASS = "sua-senha-ftp"     # ALTERE AQUI
$FTP_PATH = "/public_html"

# Diretórios locais
$LOCAL_DIST = "D:\solar-buy-side-v2\hostgator-dist"

Write-Host "Verificando diretório local..." -ForegroundColor Yellow
if (!(Test-Path $LOCAL_DIST)) {
    Write-Host "ERRO: Pasta $LOCAL_DIST não encontrada!" -ForegroundColor Red
    exit 1
}

Write-Host "Encontrados $(Get-ChildItem -Path $LOCAL_DIST -Recurse -File | Measure-Object | Select-Object -ExpandProperty Count) arquivos" -ForegroundColor Green
Write-Host ""

# Verificar se WinSCP está instalado (alternativa ao FTP nativo)
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
if (Test-Path $winscpPath) {
    Write-Host "WinSCP encontrado! Usando WinSCP para deploy..." -ForegroundColor Green

    # Criar script WinSCP
    $winscp_script = @"
option batch abort
option confirm off
open ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}
cd ${FTP_PATH}
lcd ${LOCAL_DIST}
synchronize remote -delete
exit
"@

    $winscp_script | Out-File -FilePath ".\winscp_deploy.txt" -Encoding ASCII

    & $winscpPath /script=.\winscp_deploy.txt

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Deploy concluído com sucesso!" -ForegroundColor Green
        Remove-Item ".\winscp_deploy.txt"
    } else {
        Write-Host "Erro no deploy. Código: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "WinSCP não encontrado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPÇÕES:" -ForegroundColor Cyan
    Write-Host "1. Instale WinSCP: https://winscp.net/download/WinSCP-6.3.5-Setup.exe" -ForegroundColor White
    Write-Host "2. Use FileZilla manualmente" -ForegroundColor White
    Write-Host "3. Use o deploy via SSH (se tiver acesso)" -ForegroundColor White
    Write-Host ""
    Write-Host "Para FileZilla:" -ForegroundColor Yellow
    Write-Host "  Host: $FTP_HOST" -ForegroundColor White
    Write-Host "  User: $FTP_USER" -ForegroundColor White
    Write-Host "  Local: $LOCAL_DIST" -ForegroundColor White
    Write-Host "  Remote: $FTP_PATH" -ForegroundColor White
}

Write-Host ""
Write-Host "=== FIM ===" -ForegroundColor Green
