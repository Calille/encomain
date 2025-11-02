# Email System Setup Script for The Enclosure (PowerShell)
# This script sets up the Resend API key and deploys all email Edge Functions

Write-Host "🚀 Setting up Email System for The Enclosure" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if RESEND_API_KEY is provided
if (-not $env:RESEND_API_KEY) {
    Write-Host "⚠️  RESEND_API_KEY environment variable is not set." -ForegroundColor Yellow
    Write-Host ""
    $resendKey = Read-Host "Enter your Resend API key (or press Enter to skip for now)"
    
    if ([string]::IsNullOrWhiteSpace($resendKey)) {
        Write-Host "⚠️  Skipping Resend API key setup. You'll need to set it later." -ForegroundColor Yellow
        Write-Host "   Run: supabase secrets set RESEND_API_KEY=re_your_key_here" -ForegroundColor Yellow
    } else {
        $env:RESEND_API_KEY = $resendKey
        Write-Host "🔐 Setting Resend API key..." -ForegroundColor Cyan
        supabase secrets set RESEND_API_KEY=$resendKey
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Resend API key set successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to set Resend API key" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "🔐 Setting Resend API key..." -ForegroundColor Cyan
    supabase secrets set RESEND_API_KEY=$env:RESEND_API_KEY
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Resend API key set successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to set Resend API key" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Deploying Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# List of all email functions to deploy
$functions = @(
    "send-welcome-email",
    "send-order-confirmation",
    "send-payment-receipt",
    "send-account-update",
    "send-account-deletion",
    "send-subscription-reminder",
    "send-failed-payment",
    "send-newsletter",
    "send-promotional-offer",
    "send-reengagement",
    "send-new-user-alert",
    "send-new-order-alert",
    "send-system-error",
    "send-feedback-summary"
)

# Deploy all functions
$deployed = 0
$failed = 0

foreach ($func in $functions) {
    Write-Host "📧 Deploying $func..." -ForegroundColor Cyan
    supabase functions deploy $func
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $func deployed successfully" -ForegroundColor Green
        $deployed++
    } else {
        Write-Host "❌ Failed to deploy $func" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Successfully deployed: $deployed" -ForegroundColor Green
Write-Host "   ❌ Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 All email functions deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Verify your domain in Resend dashboard"
    Write-Host "2. Test sending an email using the frontend helpers"
    Write-Host "3. Check function logs: supabase functions logs send-welcome-email"
} else {
    Write-Host "⚠️  Some functions failed to deploy. Check the errors above." -ForegroundColor Yellow
}

