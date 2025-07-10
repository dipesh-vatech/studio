# CollabFlow

This is a NextJS application for managing influencer collaborations, built with Firebase and Genkit.

## Getting Started

### 1. Set Up Environment Variables

Before running the application, you need to configure your local environment by providing API keys.

Open the `.env` file in the root of the project and add your keys. **Note:** Environment variable names are case-sensitive. Please use the exact names shown below.

*   **Firebase Keys:** You can find these values in your [Firebase project settings](https://console.firebase.google.com/). Go to Project Overview > Project settings (the gear icon) > General, and find your web app configuration.

*   **Google AI (Gemini) Key:** You can generate a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The correct variable name for this key is `GOOGLE_API_KEY`.

*   **Admin Email (Optional):** To designate an admin user who bypasses plan restrictions, set the `NEXT_PUBLIC_ADMIN_EMAIL` variable to their email address.

The `.env` file has placeholders for all the required keys:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
...

# Admin User Email
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Google AI (Gemini) API Key
GOOGLE_API_KEY=...
```

### 2. Configure Firebase Extensions

This project relies on two Firebase Extensions. You must install and configure them from the Firebase Console.

*   Go to **Build > Extensions > Explore extensions** in your Firebase project.

#### A. Trigger Email Extension

This extension is required to send notification emails.

1.  **Install:** Find and install the "Trigger Email" extension.
2.  **Configuration:** During installation, you will be asked for the following:
    *   **Cloud Functions location:** **CRITICAL!** Select **`Iowa (us-central1)`**.
    *   **Firestore Instance Location:** **CRITICAL!** Select **`Multi-region (United States)`** from the dropdown. This corresponds to `nam5` and must match your database's actual location.
    *   **Mail Collection:** Set this to `mail`. This must match the collection name used in the Cloud Function.
    *   **Default FROM address:** Enter a verified sender email from your Brevo account (e.g., `noreply@yourdomain.com`).
    *   **SMTP Connection URI:** This is the most critical step. You need to provide the connection details for your email provider. See the specific guides below.

##### SMTP Configuration - IMPORTANT!

To avoid authentication errors, we strongly recommend embedding your SMTP key directly into the connection URI.

**Recommended Method: Embed Key in URI**

1.  Leave the `SMTP password` field **blank**.
2.  Get your SMTP credentials from your email provider (e.g., Brevo). You will need your **Login/Username** and your **SMTP Key/Password**.
3.  Construct the URI in the following format: `smtps://<user>:<password>@<server>:<port>`
4.  Paste this full URI into the **SMTP Connection URI** field in the extension configuration.

**Example for Brevo:**
Your Brevo server is `smtp-relay.brevo.com` and the correct port for `smtps://` is `465`.
Your final URI should look like this:
`smtps://your.brevo.login@email.com:the-real-smtp-key-goes-here@smtp-relay.brevo.com:465`

**Alternative Method (Using Secrets):**
If you prefer to use Google Cloud Secret Manager, you can create a secret named `SMTP_PASSWORD` and use the placeholder `${SMTP_PASSWORD}` in the URI. However, be aware that the extension UI can be confusing and may not link the secret correctly, leading to authentication errors. If you encounter issues, use the direct embedding method above.

#### B. Cloud Scheduler Extension

This extension is required to run the daily notification check.

1.  **Install:** Find and install the "Trigger a function on a schedule with Cloud Scheduler" extension.
2.  **Configuration:**
    *   **Cloud Functions location:** **CRITICAL!** Select **`Iowa (us-central1)`**.
    *   **Schedule:** Set the schedule (e.g., `every 24 hours`).
    *   **Pub/Sub topic:** Set this to `daily-tick`. This must match the topic name in the Cloud Function.

### 3. Permissions Troubleshooting

If you see an error like `Permission 'iam.serviceaccounts.actAs' denied` during extension installation, you need to add a role to your user account.

1.  **Go to the IAM Page:** Open the [Google Cloud IAM page](https://console.cloud.google.com/iam-admin/iam) for your project.
2.  **Find Your Account:** In the list of "Principals", find your own email address.
3.  **Add Role:** Click the pencil icon next to your email, click **"ADD ANOTHER ROLE"**, search for and select the **`Service Account User`** role, and click **SAVE**.
4.  Retry the extension installation. It might take a minute for the permission to apply.


### 4. Install Dependencies
If you haven't already, install the project dependencies by running this in your local terminal:
```bash
npm install
```

### 5. Run the Development Servers
You need to run two servers concurrently in separate local terminals: one for the Next.js frontend and one for the Genkit AI backend.

**Terminal 1: Next.js App**
```bash
npm run dev
```
This will start the web application on `http://localhost:9002`.

**Terminal 2: Genkit AI Flows**
```bash
npm run genkit:watch
```
This starts the Genkit development server, which handles AI requests from the app.

### 6. Open the App
Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

## Deployment

To share your app with others, you need to deploy it to a public URL. This project is set up to use Firebase App Hosting.

### Prerequisites (One-Time Setup)

1.  **Install Firebase CLI:** If you don't have it, install it globally from your local terminal:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Log in to Firebase:** Run this in your local terminal to connect to your account:
    ```bash
    firebase login
    ```

### Deployment Steps (Run Every Time)

1.  **Build your app for production:**
    This command prepares your app for deployment. Run it in your local terminal.
    ```bash
    npm run build
    ```

2.  **Deploy to Firebase:**
    This command publishes your built app. Run it in your local terminal.
    ```bash
    firebase deploy --only apphosting
    ```

After the command completes, it will output the public URL for your deployed application. You can share this link with your tester.
