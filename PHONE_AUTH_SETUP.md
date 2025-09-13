# Phone Authentication Setup Guide (Firebase)

This guide explains how to set up phone-based authentication with Firebase Phone Auth (reCAPTCHA) and forgot password functionality for your Guidora application.

## Overview

Your application now supports three authentication methods:
1. **Email + Password**
2. **Google OAuth** 
3. **Phone + Password** via **Firebase** (replaces Twilio)

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/your-database-name

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (for email-based forgot password)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-web-app-id

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_LINES\n-----END PRIVATE KEY-----\n"
```

Note: Keep quotes around `FIREBASE_PRIVATE_KEY` and escape newlines as `\n`.

## Required Dependencies

Install Firebase packages:

```bash
npm install firebase firebase-admin
```

## What Changed

- Replaced Twilio SMS flow with **Firebase Phone Auth** (OTP sent by Firebase) using **reCAPTCHA** (invisible).
- Client pages (`/auth/phone-forgot-password`, `/auth/phone-reset-password`) now use Firebase to send and confirm OTPs.
- The reset password API verifies a **Firebase ID token** instead of a raw OTP.

## Files

```
lib/
├── firebaseClient.js (new)
├── firebaseAdmin.js (new)
├── smsService.js (updated: helpers only, no SMS)
app/auth/
├── phone-forgot-password/page.js (updated to Firebase)
└── phone-reset-password/page.js (updated to Firebase)
app/(protected)/api/auth/
└── phone-reset-password/route.js (verifies Firebase ID token)
```

## Flows

### Forgot Password (Phone)
1. User enters phone number on `/auth/phone-forgot-password`.
2. Firebase reCAPTCHA is initialized and `signInWithPhoneNumber` sends an OTP.
3. User is redirected to `/auth/phone-reset-password?phone=...&vid=...`.

### Reset Password (Phone)
1. User enters OTP and new password on `/auth/phone-reset-password`.
2. We create Firebase credential with `verificationId + code` and sign in.
3. We obtain Firebase **ID token** from the user and send it to `/api/auth/phone-reset-password` with the new password.
4. Server verifies ID token with Firebase Admin and updates the password for the matching phone.

## Testing

- Start the app and go to `/auth/phone-forgot-password`.
- Enter a phone number in E.164 format. For India, example: `+9198XXXXXXXX`.
- Complete reCAPTCHA and OTP flow.
- Reset password on the next page.

## Notes for India

- Firebase Phone Auth supports Indian numbers.
- Ensure the phone number includes the country code `+91`.
- You may need to enable the phone sign-in provider in **Firebase Console → Authentication**.

## Security Considerations

- Phone number ownership is proven by Firebase token verification.
- reCAPTCHA protects SMS endpoint from abuse.
- No OTPs are stored on your server anymore for phone reset.

## Troubleshooting

- If you see `auth/captcha-check-failed`, ensure the domain is whitelisted in Firebase Console.
- If `verifyIdToken` fails, check server env vars and service account key.
- On local dev, ensure `localhost` is added in Firebase auth settings.
