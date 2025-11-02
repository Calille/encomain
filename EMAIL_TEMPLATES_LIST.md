# Email Templates for "The Enclosure" Web Application

## Comprehensive Email Template List

This document outlines all recommended email templates organized by category.

---

## Authentication & Security

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| Authentication & Security | Welcome Email | When admin creates a new user account | New User | Friendly, welcoming tone. Includes temporary password, login instructions, link to first login, request to change password on first login, support contact info |
| Authentication & Security | Account Creation Confirmation | Immediately after admin creates account via admin panel | New User | Professional, informative. Welcome message, account credentials (temp password), forced password change notice, login URL, next steps |
| Authentication & Security | Password Reset Request | When user clicks "Forgot Password" | User | Professional, secure. Password reset link, expiration time, security notice if not requested, instructions |
| Authentication & Security | Password Reset Confirmation | After successful password reset | User | Confirmation tone. Confirmation that password was changed, timestamp of change, security tip, link to login if session expired |
| Authentication & Security | Password Changed Notification | After user successfully changes password | User | Security-focused. Confirmation of password change, timestamp, IP address (if available), security warning if unauthorized |
| Authentication & Security | Email Verification | After account creation (if email verification enabled) | New User | Professional. Verification link, expiration time, importance of verification, alternative contact if issues |
| Authentication & Security | Account Activated | When admin changes user status from inactive/suspended to active | User | Friendly, encouraging. Account activated confirmation, welcome back message, login link, what to expect next |
| Authentication & Security | Account Suspended | When admin suspends user account | User | Formal, clear. Reason for suspension, suspension date, appeal process, support contact, account status |
| Authentication & Security | Account Deactivated | When admin deactivates user account | User | Professional, respectful. Account deactivation notice, data retention policy, reactivation instructions if applicable, final date of access |
| Authentication & Security | Login from New Device/Location | When user logs in from unrecognized device/IP | User | Security alert tone. New login detected, location/device info, timestamp, "was this you?" with link to secure account if not |
| Authentication & Security | Failed Login Attempt Alert | After multiple failed login attempts | User | Security warning. Number of failed attempts, timestamp, account security notice, password reset option, contact support if needed |
| Authentication & Security | Profile Update Confirmation | After user updates profile information | User | Confirmation. List of updated fields, timestamp, verification of changes, link to view profile |

---

## Billing & Payments

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| Billing & Payments | Invoice Sent | When admin creates/sends a new invoice | Client | Professional, clear. Invoice number, amount due, due date, payment instructions, PDF attachment, link to view invoice in dashboard |
| Billing & Payments | Payment Receipt | When invoice status changes to "paid" | Client | Gratitude tone. Payment confirmation, invoice number, amount paid, payment date, payment method, receipt PDF, thank you message |
| Billing & Payments | Payment Reminder | 3 days before invoice due date | Client | Friendly reminder. Invoice number, amount due, due date, quick payment link, contact for questions |
| Billing & Payments | Invoice Overdue | When invoice passes due date and status = overdue | Client | Urgent but professional. Overdue amount, days overdue, late fees (if applicable), immediate payment request, contact information |
| Billing & Payments | Payment Failed | When automatic payment fails or is declined | Client | Supportive, actionable. Payment failure reason, retry date, update payment method link, support contact, amount attempted |
| Billing & Payments | Payment Method Updated | After user updates payment method | User | Confirmation. Payment method updated confirmation, last 4 digits of card, next billing date, link to manage billing |
| Billing & Payments | Billing Period Started | When new billing period begins | Client | Informative. New billing period dates, expected charges, billing frequency, link to view billing history |
| Billing & Payments | Billing Period Ended | When billing period ends | Client | Summary tone. Period summary, total amount, payment status, link to view details, upcoming period preview |
| Billing & Payments | Invoice Cancelled | When admin cancels an invoice | Client | Professional. Invoice cancellation notice, invoice number, reason (if applicable), refund information (if paid), contact for questions |
| Billing & Payments | Refund Processed | When refund is issued to client | Client | Transparent. Refund amount, refund date, refund method, original transaction reference, timeline for processing, contact for questions |
| Billing & Payments | Upcoming Payment Due (Early Warning) | 7 days before next scheduled payment | Client | Proactive. Upcoming payment amount, scheduled date, payment method on file, update payment method link, reminder to ensure funds available |
| Billing & Payments | Subscription Renewal Confirmation | When subscription/billing period renews automatically | Client | Confirmation. Renewal confirmation, new period dates, amount charged, payment method used, receipt, thank you message |

---

## Project / Client Notifications

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| Project / Client Notifications | New Project Created | When admin creates a new website project for client | Client | Exciting, engaging. Project name, project details, expected timeline, next steps, link to view project dashboard |
| Project / Client Notifications | Project Update - Milestone | When admin posts update with type "milestone" | Client | Celebratory tone. Milestone achieved, project name, milestone description, progress percentage, link to view update |
| Project / Client Notifications | Project Update - Progress | When admin posts update with type "progress" | Client | Informative, encouraging. Progress update, what's been completed, current progress %, what's next, link to dashboard |
| Project / Client Notifications | Project Update - Issue | When admin posts update with type "issue" | Client | Transparent, solution-focused. Issue identified, impact assessment, proposed solution, timeline for resolution, collaboration request |
| Project / Client Notifications | Project Completed | When project status changes to "completed" or update type is "completed" | Client | Celebratory, professional. Project completion announcement, launch date (if applicable), project summary, next steps, feedback request |
| Project / Client Notifications | Project Status Changed | When admin changes project status (e.g., in_progress → on_hold) | Client | Clear communication. Status change, reason for change (if applicable), impact on timeline, next steps, contact for questions |
| Project / Client Notifications | Project On Hold | When project status changes to "on_hold" | Client | Transparent. Project on hold notice, reason, expected resume date (if known), client action required (if any), contact information |
| Project / Client Notifications | Project Resumed | When project status changes from on_hold to active/in_progress | Client | Positive, re-engagement. Project resume notification, current status, updated timeline, next steps, enthusiasm for completion |
| Project / Client Notifications | Website Launch Notification | When website URL is added or project goes live | Client | Exciting launch announcement. Website URL, launch date, key features, maintenance info, support contact |
| Project / Client Notifications | Review/Feedback Request | After project completion or major milestone | Client | Request for engagement. Request for feedback/review, project summary, easy feedback link, testimonials welcome, gratitude |

---

## Admin Alerts

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| Admin Alerts | New User Created | When admin creates new user account via admin panel | Admin | Notification. New user details (email, name), account type, temporary password, action items (if any) |
| Admin Alerts | New Support Ticket | When client submits new support ticket | Admin | Alert tone. Ticket subject, priority, category, client name, message preview, link to respond, SLA reminder (if applicable) |
| Admin Alerts | High Priority Support Ticket | When support ticket with high/urgent priority is created | Admin | Urgent alert. Priority level, ticket details, client info, response time expectations, escalation if needed |
| Admin Alerts | Payment Received Notification | When invoice payment is recorded | Admin | Business update. Client name, invoice number, amount received, payment method, timestamp, link to billing dashboard |
| Admin Alerts | Overdue Invoice Alert | Daily/weekly digest of overdue invoices | Admin | Business reminder. List of overdue invoices, client names, amounts, days overdue, action reminders, collection strategy |
| Admin Alerts | Failed Payment Alert | When client payment fails | Admin | Business alert. Client name, failed amount, failure reason, retry date, action required, potential impact on service |
| Admin Alerts | Account Status Change Summary | Daily/weekly digest of account status changes | Admin | Administrative summary. List of status changes, users affected, dates, reasons, system health summary |
| Admin Alerts | New Contact Form Submission | When public contact form is submitted | Admin | Lead notification. Contact form details (name, email, message), timestamp, source (homepage/contact page), follow-up reminder |
| Admin Alerts | Support Ticket Response Required | When client replies to support ticket awaiting response | Admin | Follow-up alert. Ticket ID, client response preview, original ticket context, response deadline, link to ticket |
| Admin Alerts | Project Update Posted | Confirmation when admin posts project update (optional) | Admin | Confirmation. Update details, client notified, email sent status, link to edit update |
| Admin Alerts | User Login Activity Summary | Weekly digest of user login activity | Admin | Analytics summary. Active users, login frequency, inactive users, security alerts summary, system usage trends |

---

## Support System

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| Support System | Support Ticket Created - Confirmation | When user submits support ticket | User | Confirmation, helpful. Ticket ID, subject, auto-response info, expected response time, ticket tracking link |
| Support System | Support Ticket Response | When admin responds to support ticket | User | Helpful, solution-focused. Admin response, ticket context, resolution steps (if applicable), follow-up instructions, satisfaction survey link |
| Support System | Support Ticket Status Update | When ticket status changes (in_progress, resolved, closed) | User | Informative. Status change, current status, what this means, next steps, ticket link |
| Support System | Support Ticket Resolved | When ticket status changes to "resolved" | User | Gratitude, closure. Resolution summary, ticket closed notice, feedback request, reopen option if needed, thank you message |
| Support System | Support Ticket Reopened | When resolved ticket is reopened | User | Engagement. Ticket reopened notice, reason (if applicable), updated status, expected response time, ticket link |
| Support System | Support Ticket Escalated | When ticket priority is escalated | User | Assurance. Escalation notice, reason for escalation, increased priority, faster response expected, ticket link |

---

## Marketing / Engagement

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| Marketing / Engagement | Welcome Series - Getting Started | 1 day after account creation | New User | Educational, onboarding. Dashboard overview, key features, getting started guide, video tutorials (if available), support resources |
| Marketing / Engagement | Onboarding - Next Steps | 3 days after account creation (if no activity) | New User | Gentle encouragement. Reminder of account access, first project preview (if applicable), how to get started, support contact |
| Marketing / Engagement | Referral Program - Referral Sent | When user submits referral | User | Appreciative. Referral confirmation, referral code/details, referral status, rewards info, thank you for sharing |
| Marketing / Engagement | Referral Program - Referral Converted | When referred person becomes a client | Referring User | Celebration, reward. Referral conversion notification, reward details (discount/credit), how to use reward, thank you message |
| Marketing / Engagement | Referral Program - Referral Reward Credited | When referral reward is applied to account | User | Exciting, gratitude. Reward amount/type, applied to account, how to use, expiration date (if applicable), continue referring CTA |
| Marketing / Engagement | Feature Announcement | When new feature is launched | Active Users | Exciting announcement. New feature details, benefits, how to use, tutorial link, feedback welcome |
| Marketing / Engagement | Account Inactivity Reminder | After 30/60/90 days of inactivity | Inactive User | Re-engagement. We miss you message, account still active, new features since last login, easy login link, support contact |
| Marketing / Engagement | Project Milestone Celebration | When client reaches significant milestone | Client | Celebratory. Milestone achievement, progress celebration, encouragement, next goals, thank you for partnership |

---

## System Notifications

| Category | Email Name | Trigger | Recipient | Key Content / Tone |
|----------|------------|---------|-----------|---------------------|
| System Notifications | System Maintenance Notice | Before scheduled maintenance | All Users | Informative. Maintenance date/time, expected duration, affected services, alternative access (if available), apology for inconvenience |
| System Notifications | System Maintenance Complete | After maintenance completion | All Users | Confirmation. Maintenance completed, all systems operational, new features/fixes, report issues link |
| System Notifications | Service Update | For important service updates/changes | All Users | Professional announcement. Update details, impact on users, action required (if any), effective date, support contact |
| System Notifications | Data Backup Confirmation | Monthly/annual backup confirmation (optional) | User | Security reassurance. Backup completed, data safety confirmation, data retention info, security best practices |

---

## Summary Statistics

- **Total Email Templates: 47**
- **Authentication & Security: 11 templates**
- **Billing & Payments: 11 templates**
- **Project / Client Notifications: 9 templates**
- **Admin Alerts: 9 templates**
- **Support System: 6 templates**
- **Marketing / Engagement: 7 templates**
- **System Notifications: 4 templates**

---

## Implementation Priority Recommendations

### **Phase 1 - Critical (Must Have)**
1. Welcome Email (new account)
2. Password Reset Request
3. Password Reset Confirmation
4. Invoice Sent
5. Payment Receipt
6. Invoice Overdue
7. New Project Created
8. Project Update Notifications (milestone, progress, completed)
9. New Support Ticket (to admin and user)
10. Support Ticket Response

### **Phase 2 - Important (Should Have)**
11. Account Activated/Suspended
12. Payment Failed
13. Payment Reminder
14. Project Status Changed
15. Support Ticket Resolved
16. Contact Form Submission (to admin)
17. Login from New Device

### **Phase 3 - Nice to Have (Enhancement)**
18. Referral Program emails
19. Onboarding series
20. Account inactivity reminders
21. Weekly admin digests
22. Feature announcements
23. System maintenance notices

---

## Email Design Best Practices

1. **Branding**: All emails should include The Enclosure logo and brand colors (#1A4D2E)
2. **Responsive**: Mobile-friendly design with proper email client compatibility
3. **Clear CTAs**: Prominent call-to-action buttons with clear purposes
4. **Personalization**: Include user's name and relevant account/project details
5. **Security**: Never include sensitive passwords or full payment details in plain text
6. **Unsubscribe**: Include unsubscribe option for non-critical emails (GDPR compliance)
7. **Accessibility**: Proper alt text for images, readable font sizes, good contrast
8. **Consistency**: Maintain consistent tone and formatting across all templates

---

## Technical Implementation Notes

- Use Supabase Edge Functions or third-party email service (SendGrid, Resend, etc.)
- Implement email queue system for reliable delivery
- Set up email templates with variable substitution
- Configure email authentication (SPF, DKIM, DMARC)
- Track email open rates and click-through rates
- Implement email logging for audit trail
- Consider using email service webhooks for delivery status updates

