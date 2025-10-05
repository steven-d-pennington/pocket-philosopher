# PostHog API Key Issue - Fix Guide

## Problem Identified

You're getting **401 Unauthorized** errors because you're using the wrong type of PostHog API key.

**Error Message**: `API key is not valid: personal_api_key`

## Understanding PostHog API Keys

PostHog has **TWO different types** of API keys:

### 1. Project API Key (phc_...)
- **Format**: `phc_...`
- **Purpose**: Client-side event tracking (browser, mobile apps)
- **Where to use**: `NEXT_PUBLIC_POSTHOG_KEY` in `.env.local`
- **Currently**: ✅ **Correct** - You have this set properly

### 2. Project API Key (for server-side) - **DIFFERENT from Personal API Key!**
- **Format**: `phc_...` (same as client-side key!)
- **Purpose**: Server-side event tracking (Node.js, Python backends)
- **Where to use**: `POSTHOG_API_KEY` in `.env.local`
- **Currently**: ❌ **Wrong** - You have a Personal API Key (`phx_...`) instead

## The Issue

Your `.env.local` currently has:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_HZjhhoP8AIu4FNR7VC9jhMMeywLTOinZSroq6bYaXFI  ✅ Correct
POSTHOG_API_KEY=phx_gdFjadTsKDtdG15L0XY3jZwULKZ8q3y35N5pAz6qoZ2c0tF  ❌ Wrong (Personal API Key)
```

**Personal API Keys (`phx_...`)** are for admin operations (creating projects, managing users, etc.), NOT for sending events.

## Solution

You need to use the **same Project API Key** for both client and server:

### Option 1: Use the Same Key (Recommended for most cases)
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_HZjhhoP8AIu4FNR7VC9jhMMeywLTOinZSroq6bYaXFI
POSTHOG_API_KEY=phc_HZjhhoP8AIu4FNR7VC9jhMMeywLTOinZSroq6bYaXFI
```

**Note**: Using the same key for both is perfectly fine! PostHog doesn't distinguish between client and server usage for Project API Keys.

### Option 2: Get a Separate Server-Side Key (If you want different keys)

If you want a separate key for server-side tracking:

1. Go to PostHog: https://us.i.posthog.com/settings/project
2. Under **"Project API Key"**, you'll see your `phc_...` key
3. You can create **multiple Project API Keys** if needed
4. But honestly, just use the same `phc_...` key for both!

## Fix Steps

1. **Update `.env.local`**:
   ```env
   # Use the SAME Project API Key for both
   NEXT_PUBLIC_POSTHOG_KEY=phc_HZjhhoP8AIu4FNR7VC9jhMMeywLTOinZSroq6bYaXFI
   POSTHOG_API_KEY=phc_HZjhhoP8AIu4FNR7VC9jhMMeywLTOinZSroq6bYaXFI
   ```

2. **Restart your dev server**:
   ```bash
   # Kill the current dev server (Ctrl+C)
   npm run dev
   ```

3. **Test again**:
   ```bash
   npx tsx scripts/test-posthog.ts
   ```

## What About the Personal API Key?

The Personal API Key (`phx_...`) is **NOT used in this application**. It's only for admin operations like:
- Creating new PostHog projects programmatically
- Managing organizations
- Exporting data via API

You don't need it for event tracking!

## Verification

After fixing `.env.local`, you should see:
- ✅ Test script passes without 401 errors
- ✅ Events appear in PostHog dashboard
- ✅ No unauthorized errors in browser console or server logs

## Still Having Issues?

If you still get 401 errors after using `phc_...` for both keys:

1. **Check your PostHog project is active**:
   - Go to https://us.i.posthog.com/settings/project
   - Verify the project is not paused/deleted

2. **Verify the key is correct**:
   - Copy the key directly from PostHog settings
   - Make sure there are no extra spaces or line breaks

3. **Check the host URL**:
   - If you're on PostHog Cloud (US): `https://us.i.posthog.com`
   - If you're on PostHog Cloud (EU): `https://eu.i.posthog.com`
   - If self-hosted: Use your custom host URL

## Summary

**Quick Fix**: Replace `POSTHOG_API_KEY=phx_...` with `POSTHOG_API_KEY=phc_...` (use the same key as `NEXT_PUBLIC_POSTHOG_KEY`)

That's it! 🎉
