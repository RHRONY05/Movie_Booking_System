# Understanding Google OAuth 2.0 Flow

This note explains how we implemented Google Sign-in for our Movie Booking System and the core concepts behind OAuth 2.0.

## 1. The Authentication Flow (Implicit / Credential Response Flow)
We use a streamlined version of OAuth for our application:

1. **Frontend Interaction:** The user clicks "Sign in with Google" on our React frontend.
2. **Google Responds:** The frontend communicates directly with Google. Upon success, Google sends back an **ID Token** (`id_token`) to the frontend.
3. **Backend Verification:** The frontend sends this `id_token` to our backend (`POST /api/auth/google`).
4. **Validation:** Our backend uses the `google-auth-library` and our `GOOGLE_CLIENT_ID` to securely verify the signature of the token using Google's public keys. (Note: We do *not* need the `GOOGLE_CLIENT_SECRET` for this specific flow).
5. **Extraction:** Once verified, we extract the user's data (`email`, `name`, `google_id`) from the payload.
6. **Database Sync:** We check if the user exists in our database. If not, we create them.

## 2. Session Management
**Crucial Concept:** Google Auth does *not* manage sessions for our API.
Google manages the session between the user and Google.com. However, for our application, we must issue our *own* session token.
- After verifying the Google ID Token, our backend generates a custom **JSON Web Token (JWT)** using our `JWT_SECRET`.
- We send this custom JWT back to the frontend.
- The frontend will attach *our* JWT to all future requests (like booking a movie) in the `Authorization` header. This prevents our backend from having to ping Google's servers for every single API call.

## 3. The Three Types of Tokens
When interacting with Google OAuth (especially via the Authorization Code Flow), Google deals with three distinct tokens:

1. **ID Token (`id_token`):**
   - **Purpose:** Proof of Identity.
   - **Analogy:** A digital Passport. It proves *who* the user is (contains email, name, picture). This is the token we use to log the user in.
2. **Access Token (`access_token`):**
   - **Purpose:** Permission/Authorization.
   - **Analogy:** A Hotel Keycard. It gives your application permission to act on behalf of the user (e.g., reading their Google Calendar, sending emails via Gmail). We don't use this because we don't need access to their Google services.
3. **Refresh Token (`refresh_token`):**
   - **Purpose:** Token Renewal.
   - **Analogy:** A Master Key in a vault. Access tokens expire quickly (e.g., 1 hour) for security. The refresh token is a long-lived token used by the backend to quietly ask Google for a fresh Access Token without forcing the user to log in again.

## 4. Testing without a Frontend (Google OAuth Playground)
You don't need to build a React frontend just to test Google OAuth! You can use the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/):

1. Click the **Gear icon** -> Check "Use your own OAuth credentials".
2. Enter your **Client ID** and **Client Secret**.
3. **Important:** Ensure `https://developers.google.com/oauthplayground` is added to your **Authorized redirect URIs** in the Google Cloud Console to prevent a `redirect_uri_mismatch` error.
4. Select the `email` and `profile` scopes (and `openid`) and authorize.--->(Step 1:Select & authorize APIs-->Google OAuth Api V2)
5. Exchange the authorization code for tokens.--->(Step 2:Exchange authorization code for tokens)
6. Look at the raw JSON response on the right-hand side to find the huge `"id_token"` string.  
7. Send that `id_token` in a POST request to your backend to test your authentication flow!
