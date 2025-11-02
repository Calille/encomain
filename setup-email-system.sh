#!/bin/bash

# Email System Setup Script for The Enclosure
# This script sets up the Resend API key and deploys all email Edge Functions

echo "🚀 Setting up Email System for The Enclosure"
echo "=============================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if RESEND_API_KEY is provided
if [ -z "$RESEND_API_KEY" ]; then
    echo "⚠️  RESEND_API_KEY environment variable is not set."
    echo ""
    read -p "Enter your Resend API key (or press Enter to skip for now): " resend_key
    
    if [ -z "$resend_key" ]; then
        echo "⚠️  Skipping Resend API key setup. You'll need to set it later."
        echo "   Run: supabase secrets set RESEND_API_KEY=re_your_key_here"
    else
        export RESEND_API_KEY="$resend_key"
        echo "🔐 Setting Resend API key..."
        supabase secrets set RESEND_API_KEY="$resend_key"
        if [ $? -eq 0 ]; then
            echo "✅ Resend API key set successfully"
        else
            echo "❌ Failed to set Resend API key"
            exit 1
        fi
    fi
else
    echo "🔐 Setting Resend API key..."
    supabase secrets set RESEND_API_KEY="$RESEND_API_KEY"
    if [ $? -eq 0 ]; then
        echo "✅ Resend API key set successfully"
    else
        echo "❌ Failed to set Resend API key"
        exit 1
    fi
fi

echo ""
echo "📦 Deploying Edge Functions..."
echo ""

# List of all email functions to deploy
functions=(
    "send-welcome-email"
    "send-order-confirmation"
    "send-payment-receipt"
    "send-account-update"
    "send-account-deletion"
    "send-subscription-reminder"
    "send-failed-payment"
    "send-newsletter"
    "send-promotional-offer"
    "send-reengagement"
    "send-new-user-alert"
    "send-new-order-alert"
    "send-system-error"
    "send-feedback-summary"
)

# Deploy all functions
deployed=0
failed=0

for func in "${functions[@]}"; do
    echo "📧 Deploying $func..."
    supabase functions deploy "$func"
    if [ $? -eq 0 ]; then
        echo "✅ $func deployed successfully"
        ((deployed++))
    else
        echo "❌ Failed to deploy $func"
        ((failed++))
    fi
    echo ""
done

echo "=============================================="
echo "📊 Deployment Summary:"
echo "   ✅ Successfully deployed: $deployed"
echo "   ❌ Failed: $failed"
echo ""

if [ $failed -eq 0 ]; then
    echo "🎉 All email functions deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify your domain in Resend dashboard"
    echo "2. Test sending an email using the frontend helpers"
    echo "3. Check function logs: supabase functions logs send-welcome-email"
else
    echo "⚠️  Some functions failed to deploy. Check the errors above."
fi

