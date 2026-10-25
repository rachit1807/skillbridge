# SkillBridge verification walkthrough

Use a local preview and synthetic account when collecting screenshots. Never publish a real password, JWT or session cookie.

1. Open the app in Safari. In a private window, choose **My workspace**. The sign-in dialog should open.
2. Choose **Create an account**, provide a name, valid email and password with at least eight characters. The workspace opens after successful registration.
3. In Safari Web Inspector → Storage → Cookies, inspect the `sb_session` cookie attributes. It should be HttpOnly and SameSite=Lax. Secure is enabled under HTTPS. Keep the cookie value hidden in screenshots.
4. In Network, inspect an authenticated `/api/enrollments` request. It should use a bearer authorization header. Do not capture the token value. Application localStorage should contain only the theme preference, not an authentication token.
5. Explore a course and choose **Enroll for free**. Mark a lesson complete and save a personal note. The dashboard should show one enrolled course and one completed lesson.
6. Refresh, then reopen **My workspace**. The signed-in account and progress should remain available.
7. Open the profile menu and choose **Sign out**. The interface returns to the overview and **My workspace** requests sign-in again. The API integration test additionally checks that the old JWT no longer works.
8. Toggle between storm and dawn themes. Reload to confirm the choice persists. In Safari responsive design mode, use a 390 × 844 viewport and verify the navigation, catalog, forms and lesson reader.
9. Enable the operating system’s reduced-motion preference. Decorative animation and lightning should stop.

## Automated checks

`npm run test:api` verifies the account lifecycle and ownership rules against the local server. `npm run typecheck` verifies TypeScript. `npm run build` produces the deployable client and server.
