# Test Welcome Email Function
# This script sends a test welcome email to joshwicks2015@gmail.com

$email = "joshwicks2015@gmail.com"
$functionUrl = "https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1/send-welcome-email"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNiZHBiZW9odGZ3bmxmZGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTY0MTAsImV4cCI6MjA3NzU3MjQxMH0.uDue2h_qH4guNIRom8TRY3lgxnWUYQsT9zgjQRSAeBo"

Write-Host "`n=== Testing Welcome Email Function ===" -ForegroundColor Green
Write-Host "Sending test email to: $email`n" -ForegroundColor Yellow

$body = @{
    email = $email
    userName = "Josh"
    loginUrl = "https://theenclosure.co.uk/login"
    dashboardUrl = "https://theenclosure.co.uk/dashboard"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $functionUrl `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $anonKey"
            "Content-Type" = "application/json"
        } `
        -Body $body

    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    if ($response.success) {
        Write-Host "`n📧 Email sent successfully!" -ForegroundColor Green
        Write-Host "Message ID: $($response.messageId)" -ForegroundColor Gray
        Write-Host "`nCheck your inbox at: $email" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "`nError response:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green

