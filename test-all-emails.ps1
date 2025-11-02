# Test All Email Functions
# This script provides test commands for all email functions

$testEmail = "joshwicks2015@gmail.com"
$baseUrl = "https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNiZHBiZW9odGZ3bmxmZGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTY0MTAsImV4cCI6MjA3NzU3MjQxMH0.uDue2h_qH4guNIRom8TRY3lgxnWUYQsT9zgjQRSAeBo"

Write-Host "`n=== Email Function Test Script ===" -ForegroundColor Green
Write-Host "Test Email: $testEmail`n" -ForegroundColor Yellow

function Test-EmailFunction {
    param(
        [string]$FunctionName,
        [string]$FunctionUrl,
        [hashtable]$BodyData
    )
    
    Write-Host "Testing: $FunctionName..." -ForegroundColor Cyan
    
    $body = $BodyData | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $FunctionUrl `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $anonKey"
                "Content-Type" = "application/json"
            } `
            -Body $body

        if ($response.success) {
            Write-Host "  ✅ SUCCESS - Message ID: $($response.messageId)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ FAILED - $($response.error)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n1. Testing Welcome Email..." -ForegroundColor Yellow
Test-EmailFunction -FunctionName "Welcome Email" `
    -FunctionUrl "$baseUrl/send-welcome-email" `
    -BodyData @{
        email = $testEmail
        userName = "Josh"
        loginUrl = "https://theenclosure.co.uk/login"
        dashboardUrl = "https://theenclosure.co.uk/dashboard"
    }

Write-Host "`n2. Testing Order Confirmation Email..." -ForegroundColor Yellow
Test-EmailFunction -FunctionName "Order Confirmation" `
    -FunctionUrl "$baseUrl/send-order-confirmation" `
    -BodyData @{
        email = $testEmail
        userName = "Josh"
        order = @{
            orderId = "test-123"
            orderNumber = "ORD-001"
            items = @(
                @{
                    id = "item-1"
                    name = "Test Product"
                    quantity = 1
                    price = 29.99
                    total = 29.99
                }
            )
            subtotal = 29.99
            tax = 0
            shipping = 5.00
            total = 34.99
            currency = "GBP"
            orderDate = (Get-Date).ToString("o")
        }
        orderDetailsUrl = "https://theenclosure.co.uk/orders/test-123"
    }

Write-Host "`n3. Testing Payment Receipt Email..." -ForegroundColor Yellow
Test-EmailFunction -FunctionName "Payment Receipt" `
    -FunctionUrl "$baseUrl/send-payment-receipt" `
    -BodyData @{
        email = $testEmail
        userName = "Josh"
        payment = @{
            transactionId = "txn-test-123"
            invoiceNumber = "INV-001"
            amount = 34.99
            currency = "GBP"
            paymentMethod = "Credit Card"
            paymentDate = (Get-Date).ToString("o")
            status = "completed"
        }
        receiptUrl = "https://theenclosure.co.uk/receipts/txn-test-123"
    }

Write-Host "`n4. Testing Account Update Email..." -ForegroundColor Yellow
Test-EmailFunction -FunctionName "Account Update" `
    -FunctionUrl "$baseUrl/send-account-update" `
    -BodyData @{
        email = $testEmail
        userName = "Josh"
        updatedFields = @("email", "phone")
        updatedAt = (Get-Date).ToString("o")
        accountSettingsUrl = "https://theenclosure.co.uk/settings"
    }

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Check your inbox at: $testEmail`n" -ForegroundColor Yellow

