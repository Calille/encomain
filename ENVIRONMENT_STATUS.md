# 🔍 Environment Check Results - The Enclosure Project

**Operating System**: Windows 10/11 (PowerShell)
**Date Checked**: Current

---

## ✅ What's Installed

### 1. npm ✅
- **Version**: 10.9.3
- **Status**: ✅ Working correctly
- **Location**: System-wide installation

### 2. Project Structure ✅
- **All 14 Email Edge Functions**: ✅ Created
- **Shared Utilities**: ✅ Present (`_shared/email-service.ts`, `_shared/types.ts`)
- **Email Templates**: ✅ All templates created in `/emails/` directory

### 3. package.json Scripts ✅
- **`deploy:emails`**: `supabase functions deploy` - Deploys all Edge Functions
- **`setup:email`**: Setup script runner (Bash only)
- **`test:email`**: `supabase functions serve` - Local testing

### 4. Environment File ✅
- **`.env.local`**: ✅ Exists
- Contains: `VITE_SUPABASE_URL` and `SUPABASE_PROJECT_ID`
- Supabase anon key: Present (check `.env.local` file)

---

## ❌ What's Missing

### 1. Supabase CLI ❌
**Status**: NOT INSTALLED
**Impact**: Cannot deploy Edge Functions or set secrets
**Required**: Yes (critical)

### 2. Supabase Project Link ❌
**Status**: NOT LINKED
**Evidence**: 
- No `.supabase` folder found
- No `config.toml` found
**Impact**: Cannot deploy functions without linking

### 3. Resend API Key ❌
**Status**: NOT SET
**Location**: Should be set as Supabase secret (not in `.env.local`)
**Required**: Yes (for sending emails)

---

## 📦 Created Email Functions (14 Total)

All Edge Functions have been created:

1. ✅ `send-welcome-email`
2. ✅ `send-order-confirmation`
3. ✅ `send-payment-receipt`
4. ✅ `send-account-update`
5. ✅ `send-account-deletion`
6. ✅ `send-subscription-reminder`
7. ✅ `send-failed-payment`
8. ✅ `send-newsletter`
9. ✅ `send-promotional-offer`
10. ✅ `send-reengagement`
11. ✅ `send-new-user-alert`
12. ✅ `send-new-order-alert`
13. ✅ `send-system-error`
14. ✅ `send-feedback-summary`

**Location**: `supabase/functions/`

---

## 🚀 Installation Commands (Windows)

### Step 1: Install Supabase CLI

**Open PowerShell (as Administrator recommended):**

```powershell
npm install -g supabase
```

**Verify Installation:**
```powershell
supabase --version
```

You should see something like: `supabase version x.x.x`

### Step 2: Login to Supabase

```powershell
supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

**Your Project Details:**
- **Project ID**: `eqqcbdpbeohtfwnlfdgx`
- **Project Name**: Enlcosure
- **API URL**: `https://eqqcbdpbeohtfwnlfdgx.supabase.co`

**Link Command:**
```powershell
supabase link --project-ref eqqcbdpbeohtfwnlfdgx
```

This will:
- Create `.supabase` folder
- Create `config.toml` configuration
- Link your local project to the remote Supabase project

### Step 4: Set Resend API Key

**Get your Resend API key:**
1. Go to https://resend.com/api-keys
2. Create a new API key (if needed)
3. Copy the key (starts with `re_`)

**Set the secret:**
```powershell
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

**Verify it's set:**
```powershell
supabase secrets list
```

You should see `RESEND_API_KEY` in the list (the value won't be shown for security).

### Step 5: Deploy All Email Functions

**Option A: Deploy all at once (Recommended)**
```powershell
npm run deploy:emails
```

**Option B: Deploy individually**
```powershell
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

---

## ✅ Verification Steps

After installation, verify everything works:

```powershell
# 1. Check Supabase CLI version
supabase --version

# 2. Check if project is linked
supabase projects list

# 3. Check secrets (should show RESEND_API_KEY)
supabase secrets list

# 4. Check deployed functions
supabase functions list
```

---

## 📋 Complete Setup Checklist

- [ ] **Install Supabase CLI**: `npm install -g supabase`
- [ ] **Verify CLI**: `supabase --version` shows version number
- [ ] **Login to Supabase**: `supabase login`
- [ ] **Link Project**: `supabase link --project-ref eqqcbdpbeohtfwnlfdgx`
- [ ] **Get Resend API Key**: From https://resend.com/api-keys
- [ ] **Set Resend Key**: `supabase secrets set RESEND_API_KEY=re_your_key`
- [ ] **Verify Secret**: `supabase secrets list`
- [ ] **Deploy Functions**: `npm run deploy:emails`
- [ ] **Verify Deployment**: Check Supabase Dashboard → Edge Functions

---

## 🔍 Current Configuration

### Project Details
- **Supabase Project ID**: `eqqcbdpbeohtfwnlfdgx`
- **Project Name**: Enlcosure
- **Status**: ACTIVE_HEALTHY ✅
- **Region**: eu-west-1

### Environment File (`.env.local`)
- ✅ `VITE_SUPABASE_URL` - Set
- ✅ `SUPABASE_PROJECT_ID` - Set
- ✅ `VITE_SUPABASE_ANON_KEY` - Likely set (check your file)

### What's Missing
- ❌ Supabase CLI installed
- ❌ Project linked (no `.supabase` folder)
- ❌ Resend API key set as secret

---

## 🎯 Next Steps (In Order)

1. **Install Supabase CLI**
   ```powershell
   npm install -g supabase
   ```

2. **Link Your Project**
   ```powershell
   supabase login
   supabase link --project-ref eqqcbdpbeohtfwnlfdgx
   ```

3. **Set Resend API Key**
   ```powershell
   # Get key from https://resend.com/api-keys
   supabase secrets set RESEND_API_KEY=re_your_key_here
   ```

4. **Deploy Functions**
   ```powershell
   npm run deploy:emails
   ```

5. **Verify**
   - Check Supabase Dashboard → Edge Functions
   - Test sending an email

---

## 📚 Helpful Commands Reference

```powershell
# Check CLI version
supabase --version

# Login
supabase login

# Link project
supabase link --project-ref eqqcbdpbeohtfwnlfdgx

# Set secret
supabase secrets set KEY_NAME=value

# List secrets
supabase secrets list

# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name

# List deployed functions
supabase functions list

# View function logs
supabase functions logs function-name

# Test function locally
supabase functions serve function-name
```

---

## ⚠️ Important Notes

1. **Resend API Key**: Should NOT be in `.env.local`. It must be set as a Supabase secret.

2. **Supabase Secrets**: Only accessible to Edge Functions, not frontend code.

3. **Function Deployment**: Functions are deployed to your Supabase project and can be called from anywhere (frontend, backend, etc.).

4. **Domain Verification**: After setup, verify `theenclosure.co.uk` in Resend dashboard to send emails.

---

## 🆘 Troubleshooting

### "supabase: command not found"
- Make sure you installed it: `npm install -g supabase`
- Restart PowerShell/terminal
- Check npm global path: `npm config get prefix`

### "Project not linked"
- Run: `supabase link --project-ref eqqcbdpbeohtfwnlfdgx`
- Check you're logged in: `supabase login`

### "RESEND_API_KEY is not set"
- Set it: `supabase secrets set RESEND_API_KEY=re_your_key`
- Verify: `supabase secrets list`

### "Function deployment failed"
- Check you're in project root
- Verify project is linked
- Check function code for errors
- View logs: `supabase functions logs function-name`

---

**You're ready to set up!** Start with Step 1 (installing Supabase CLI) and work through the checklist. ✅

