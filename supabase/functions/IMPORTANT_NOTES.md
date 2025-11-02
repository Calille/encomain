# Important Notes - Email System Setup

## React Email Compatibility with Deno

The Edge Functions import React Email templates directly from the `emails/` directory. This should work in Deno, but if you encounter issues, here are alternative approaches:

### Option 1: Pre-render Templates (Recommended)

If React Email doesn't work directly in Edge Functions, pre-render templates during build:

```typescript
// In a build script or CI/CD
import { render } from '@react-email/components';
import { WelcomeEmail } from '../emails/WelcomeEmail.tsx';

// Render to HTML string and save
const html = await render(WelcomeEmail({ ... }));
// Save to a templates directory
```

Then import the pre-rendered HTML in Edge Functions.

### Option 2: Use Deno-compatible Imports

Ensure you're using the correct import syntax for Deno:

```typescript
// In Edge Functions, use import maps or npm: protocol
import { render } from 'npm:@react-email/components@0.0.28';
```

### Option 3: Server-Side Rendering API

Use React Email's server-side rendering API outside of Edge Functions, then pass HTML to Edge Functions.

## Template Import Paths

The Edge Functions assume templates are in `../../../emails/` relative to the function directory. Adjust paths if your structure differs:

```
supabase/
  functions/
    send-welcome-email/
      index.ts  (imports from ../../../emails/WelcomeEmail.tsx)
emails/
  WelcomeEmail.tsx
```

## Testing Before Deployment

1. **Test Email Rendering Locally**:
   ```bash
   cd emails
   email dev
   ```

2. **Test Edge Function Locally**:
   ```bash
   supabase functions serve send-welcome-email --env-file .env.local
   ```

3. **Verify Resend Configuration**:
   - Domain verified in Resend
   - API key is correct
   - Email addresses are configured

## Logo URL Configuration

Update the logo URL in `emails/shared/constants.ts`:

```typescript
export const LOGO_URL = 'https://theenclosure.co.uk/assets/images/logo.png';
```

Ensure:
- Logo is publicly accessible
- URL is correct (HTTPS)
- Image format is supported (PNG, JPG, SVG)

## Email Address Configuration

In Resend, configure these email addresses:

- `hello@theenclosure.co.uk` - General communication
- `orders@theenclosure.co.uk` - Order confirmations
- `notifications@theenclosure.co.uk` - Account notifications
- `admin@theenclosure.co.uk` - Admin alerts

## Error Handling

All functions include error handling and logging. Check Supabase logs:

```bash
supabase functions logs send-welcome-email
```

## Performance Considerations

- **Email Rendering**: Rendering React Email templates can be slow. Consider:
  - Caching rendered templates
  - Using simpler templates for Edge Functions
  - Pre-rendering templates

- **Rate Limiting**: Implement rate limiting for:
  - Marketing emails
  - Bulk notifications
  - Automated alerts

## Security

- **API Keys**: Never commit API keys. Use Supabase secrets.
- **Input Validation**: All functions validate required fields.
- **CORS**: Functions include CORS headers for frontend access.

## Updates

If you need to update email templates:

1. Update the template in `emails/` directory
2. Re-deploy Edge Functions (if templates are bundled)
3. Or just update templates (if using external rendering)

## Support

For issues:
1. Check Supabase Edge Functions logs
2. Check Resend dashboard for delivery status
3. Test email rendering locally first
4. Verify domain configuration in Resend

