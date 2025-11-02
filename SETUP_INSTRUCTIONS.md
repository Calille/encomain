# 🚀 Email System Setup - Complete Instructions

## Your Supabase Project

- **Project ID**: `eqqcbdpbeohtfwnlfdgx`
- **Project Name**: Enlcosure
- **API URL**: `https://eqqcbdpbeohtfwnlfdgx.supabase.co`
- **Status**: ACTIVE_HEALTHY ✅

## Quick Start (Choose One Method)

### Method 1: Automated Setup Script (Recommended) 🎯

#### For Windows (PowerShell):
```powershell
.\setup-email-system.ps1
```

#### For Mac/Linux (Bash):
```bash
chmod +x setup-email-system.sh
./setup-email-system.sh
```

Or with your Resend API key:
```bash
RESEND_API_KEY=re_your_key_here ./setup-email-system.sh
```

The script will:
1. ✅ Check if Supabase CLI is installed
2. ✅ Prompt for Resend API key (if not provided)
3. ✅ Set the Resend API key as a Supabase secret
4. ✅ Deploy all 14 email Edge Functions
5. ✅ Show deployment summary

### Method 2: Manual Setup

#### Step 1: Install Supabase CLI (if needed)

```bash
npm install -g supabase
```

#### Step 2: Link Your Project

```bash
supabase link --project-ref eqqcbdpbeohtfwnlfdgx
```

#### Step 3: Set Resend API Key

Get your API key from [Resend Dashboard](https://resend.com/api-keys), then:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

#### Step 4: Deploy All Functions

Deploy all at once:
```bash
supabase functions deploy
```

Or using npm script:
```bash
npm run deploy:emails
```

#### Step 5: Verify Deployment

Check logs:
```bash
supabase functions logs send-welcome-email
```

Test a function:
```bash
curl -i --location --request POST \
  'https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNiZHBiZW9odGZ3bmxmZGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTY0MTAsImV4cCI6MjA3NzU3MjQxMH0.uDue2h_qH4guNIRom8TRY3lgxnWUYQsT9zgjQRSAeBo' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "test@example.com",
    "userName": "Test User"
  }'
```

## Configure Resend Domain

1. **Go to Resend Dashboard**: https://resend.com/domains
2. **Add Domain**: Click "Add Domain" and enter `theenclosure.co.uk`
3. **Add DNS Records**: Resend will show you DNS records to add:
   - SPF record
   - DKIM record  
   - DMARC record (optional but recommended)
4. **Wait for Verification**: Usually takes 5-15 minutes
5. **Verify Status**: Check that domain shows as "Verified" in Resend dashboard

## Update Logo URL

Edit `emails/shared/constants.ts` and update:

```typescript
export const LOGO_URL = 'https://theenclosure.co.uk/assets/images/logo.png';
```

Make sure:
- Logo is publicly accessible at this URL
- URL is HTTPS
- Image format is supported (PNG, JPG, SVG)

## Test Email Sending

### From Frontend (React/TypeScript)

```typescript
import { sendWelcomeEmail } from './utils/emailHelpers';

// After user verifies email
await sendWelcomeEmail('user@example.com', {
  userName: 'John Doe',
  loginUrl: 'https://theenclosure.co.uk/login',
  dashboardUrl: 'https://theenclosure.co.uk/dashboard',
});
```

### Test All Email Types

See `supabase/functions/README.md` for complete usage examples for all 14 email types.

## Available Email Functions

All deployed Edge Functions:

1. ✅ `send-welcome-email` - Welcome email after verification
2. ✅ `send-order-confirmation` - Order confirmation
3. ✅ `send-payment-receipt` - Payment receipt
4. ✅ `send-account-update` - Account update notification
5. ✅ `send-account-deletion` - Account deletion confirmation
6. ✅ `send-subscription-reminder` - Subscription renewal reminder
7. ✅ `send-failed-payment` - Failed payment alert
8. ✅ `send-newsletter` - Monthly newsletter
9. ✅ `send-promotional-offer` - Promotional offers
10. ✅ `send-reengagement` - Re-engagement for inactive users
11. ✅ `send-new-user-alert` - Admin: New user signup
12. ✅ `send-new-order-alert` - Admin: New order notification
13. ✅ `send-system-error` - Admin: System error alerts
14. ✅ `send-feedback-summary` - Admin: Weekly feedback summary

## Verification Checklist

After setup, verify:

- [ ] Supabase CLI installed: `supabase --version`
- [ ] Project linked: `supabase projects list`
- [ ] Resend API key set: `supabase secrets list` (should show RESEND_API_KEY)
- [ ] All functions deployed: Check Supabase Dashboard → Edge Functions
- [ ] Domain verified in Resend dashboard
- [ ] Logo URL updated in `emails/shared/constants.ts`
- [ ] Test email sent successfully

## Troubleshooting

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "Project not linked"
```bash
supabase link --project-ref eqqcbdpbeohtfwnlfdgx
```

### "RESEND_API_KEY is not set"
```bash
# Check if set
supabase secrets list

# Set it
supabase secrets set RESEND_API_KEY=re_your_key_here
```

### "Function deployment failed"
- Check you're in the project root directory
- Verify `supabase/functions/` directory exists
- Check function logs: `supabase functions logs [function-name]`

### "Email not received"
- Check Resend dashboard for delivery status
- Verify domain is verified in Resend
- Check spam folder
- Ensure recipient email is valid

### "Email rendering error"
See `supabase/functions/IMPORTANT_NOTES.md` for React Email compatibility solutions.

## Next Steps

1. **Set up email triggers** in your application code
2. **Test each email type** to ensure proper rendering
3. **Monitor email delivery** in Resend dashboard
4. **Set up error alerts** for failed sends
5. **Implement retry logic** for critical emails

## Support Resources

- **Setup Script**: `setup-email-system.ps1` (Windows) or `setup-email-system.sh` (Mac/Linux)
- **Quick Setup Guide**: `QUICK_SETUP.md`
- **Complete Documentation**: `supabase/functions/README.md`
- **Important Notes**: `supabase/functions/IMPORTANT_NOTES.md`
- **Email Templates List**: `EMAIL_TEMPLATES_LIST.md`

## Need Help?

1. Check function logs: `supabase functions logs [function-name]`
2. Review `supabase/functions/README.md` for detailed docs
3. Check `supabase/functions/IMPORTANT_NOTES.md` for common issues
4. Verify Resend dashboard for delivery status

---

**Ready to go?** Run the setup script: `.\setup-email-system.ps1` (Windows) or `./setup-email-system.sh` (Mac/Linux)

