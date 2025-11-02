# 🚀 Quick Setup Guide - Email System

## Your Supabase Project Details

- **Project ID**: `eqqcbdpbeohtfwnlfdgx`
- **Project Name**: Enlcosure
- **Status**: ACTIVE_HEALTHY ✅
- **Region**: eu-west-1
- **API URL**: `https://eqqcbdpbeohtfwnlfdgx.supabase.co`

## Prerequisites

1. **Supabase CLI installed**:
   ```bash
   npm install -g supabase
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref eqqcbdpbeohtfwnlfdgx
   ```

3. **Get your Resend API key**:
   - Sign up at [resend.com](https://resend.com) if you haven't
   - Go to API Keys section
   - Create a new API key
   - Copy it (starts with `re_`)

## Option 1: Automated Setup (Recommended)

### Windows (PowerShell):
```powershell
.\setup-email-system.ps1
```

### Mac/Linux (Bash):
```bash
chmod +x setup-email-system.sh
./setup-email-system.sh
```

Or with your Resend API key:
```bash
RESEND_API_KEY=re_your_key_here ./setup-email-system.sh
```

## Option 2: Manual Setup

### Step 1: Set Resend API Key

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Step 2: Deploy All Functions

Deploy all at once:
```bash
supabase functions deploy
```

Or deploy individually:
```bash
supabase functions deploy send-welcome-email
supabase functions deploy send-order-confirmation
supabase functions deploy send-payment-receipt
supabase functions deploy send-account-update
supabase functions deploy send-account-deletion
supabase functions deploy send-subscription-reminder
supabase functions deploy send-failed-payment
supabase functions deploy send-newsletter
supabase functions deploy send-promotional-offer
supabase functions deploy send-reengagement
supabase functions deploy send-new-user-alert
supabase functions deploy send-new-order-alert
supabase functions deploy send-system-error
supabase functions deploy send-feedback-summary
```

### Step 3: Verify Deployment

Check function logs:
```bash
supabase functions logs send-welcome-email
```

Test a function:
```bash
curl -i --location --request POST \
  'https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "test@example.com",
    "userName": "Test User"
  }'
```

## Step 4: Configure Resend Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add domain: `theenclosure.co.uk`
3. Add DNS records as instructed:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
4. Wait for verification (usually takes a few minutes)

## Step 5: Update Logo URL

Edit `emails/shared/constants.ts` and update:
```typescript
export const LOGO_URL = 'https://theenclosure.co.uk/assets/images/logo.png';
```

Make sure your logo is publicly accessible at this URL.

## Step 6: Test from Frontend

Use the helper functions in your React app:

```typescript
import { sendWelcomeEmail } from './utils/emailHelpers';

// After user verifies email
await sendWelcomeEmail(user.email, {
  userName: user.name,
});
```

## Verification Checklist

- [ ] Supabase CLI installed
- [ ] Project linked (`supabase link`)
- [ ] Resend API key set (`supabase secrets set RESEND_API_KEY`)
- [ ] All functions deployed (`supabase functions deploy`)
- [ ] Domain verified in Resend dashboard
- [ ] Logo URL updated in constants.ts
- [ ] Test email sent successfully

## Troubleshooting

### Functions not deploying?
- Check you're in the project root
- Verify project is linked: `supabase projects list`
- Check Supabase CLI is up to date: `supabase --version`

### "RESEND_API_KEY is not set" error?
- Verify secret is set: `supabase secrets list`
- Re-set the key: `supabase secrets set RESEND_API_KEY=re_your_key`

### Email not received?
- Check Resend dashboard for delivery status
- Verify domain is verified in Resend
- Check spam folder
- Ensure recipient email is valid

### Need help?
- Check function logs: `supabase functions logs [function-name]`
- Review `supabase/functions/README.md` for detailed docs
- Check `supabase/functions/IMPORTANT_NOTES.md` for common issues

## Next Steps

1. **Set up email triggers** in your application code
2. **Test each email type** to ensure they render correctly
3. **Monitor email delivery** in Resend dashboard
4. **Set up error alerts** for failed email sends
5. **Implement retry logic** for critical emails

## Support Resources

- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Resend Documentation**: https://resend.com/docs
- **React Email**: https://react.email/docs

