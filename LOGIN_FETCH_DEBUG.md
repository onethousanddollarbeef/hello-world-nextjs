# Login Fetch Troubleshooting (Vercel)

Use this checklist when sign-in appears to fail in production (Vercel), especially if localhost works.

## 1) Reproduce on the deployed URL

1. Open your Vercel deployment URL in a private/incognito window.
2. Open browser DevTools:
   - **Network** tab
   - **Console** tab
3. Click **Sign in with Google** exactly once.

## 2) Verify the initial OAuth request is sent

In **Network**, filter by `auth` or `oauth` and confirm a request starts after clicking the button.

- If no request appears:
  - The click handler may not be running (JS/runtime error, hydration issue).
  - Check **Console** first for red errors.

## 3) Check the callback request

After Google login, you should return to:

- `/auth/callback?code=...`

In Network, click that request and verify:

- Status is 200/30x (not 500)
- `code` query param exists

If `code` is missing, provider redirect config is likely wrong.

## 4) Check callback redirect result

This app currently does:

- on failure: redirect to `/?auth=failed`
- on success: redirect to `/project1`

If you land at `/?auth=failed`, the code exchange with Supabase failed.

## 5) Validate Vercel environment variables

In Vercel project settings, confirm production env vars are set and correct:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- server-side `SUPABASE_SERVICE_ROLE_KEY` (if your server code needs it)
- any URL/origin vars used by auth logic

Then **redeploy** after changes.

## 6) Validate Supabase Auth URL config

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL** should match your deployed domain
- **Redirect URLs** must include:
  - `https://<your-vercel-domain>/auth/callback`

Missing/mismatched callback URLs are one of the most common causes.

## 7) Confirm browser privacy/cookie behavior

If requests fire but session does not persist:

- Disable strict tracking prevention temporarily
- Try another browser
- Check if third-party/cross-site cookie blocking is active

## 8) Collect concrete failure evidence

From Network request details, capture:

- Request URL
- Status code
- Response body (if any)
- Response headers

For callback failure, capture the exact URL you land on.

## 9) Quick interpretation guide

- **No request at click** → frontend handler/runtime issue
- **OAuth provider error page** → provider redirect config issue
- **`/auth/callback` 500** → backend/env misconfiguration
- **`/?auth=failed` redirect** → Supabase code exchange failure
- **Success redirect but immediately signed out** → session cookie/storage issue

## 10) Optional targeted logging

Temporarily add structured logs in callback route:

- whether `code` exists
- Supabase exchange error message
- final redirect path

Deploy, reproduce once, inspect Vercel logs, then remove verbose logs.
