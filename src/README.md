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
    *   **Firestore Instance Location:** **CRITICAL!** Set this to **`Multi-region (United States)`**. This must match your database's actual location (`nam5`), and is a common source of errors. The deployment will fail if this is incorrect.
    *   **Mail Collection:** Set this to `mail`. This must match the collection name used in the Cloud Function.
    *   **Default FROM address:** Enter the email address you are sending from (e.g., `noreply@yourdomain.com`).
    *   **SMTP Connection URI:** This is the most critical step. You need to provide the connection details for your email provider. The format is `smtps://<user>:<password>@<server>:<port>`.

##### SMTP Configuration for Brevo (Recommended)

1.  Log in to your [Brevo](https://www.brevo.com/) account.
2.  In the top-right menu, go to **SMTP & API**.
3.  You will see your SMTP credentials. You need the **Login** email and you must generate an **SMTP Key** to use as the password.
4.  Click **Create a new SMTP Key**. Give it a descriptive name (e.g., "CollabFlow App") and copy the key.
5.  Your Brevo SMTP server is `smtp-relay.brevo.com` and the recommended port is `465` (for SMTPS).
6.  Your final URI will look like this. Replace the placeholders with your actual Brevo credentials:
    `smtps://your.brevo.login@email.com:YOUR_BREVO_SMTP_KEY@smtp-relay.brevo.com:465`

##### SMTP Configuration for Gmail/Google Workspace

1.  You **must** use an **App Password**. You cannot use your regular Google password.
2.  Enable 2-Step Verification on your Google Account.
3.  Go to your Google Account settings and generate an [App Password](https://myaccount.google.com/apppasswords).
4.  Your URI will look like this: `smtps://your.email@gmail.com:YOUR_16_DIGIT_APP_PASSWORD@smtp.gmail.com:465`

#### B. Cloud Scheduler Extension

This extension is required to run the daily notification check.

1.  **Install:** Find and install the "Trigger a function on a schedule with Cloud Scheduler" extension.
2.  **Configuration:**
    *   **Cloud Functions location:** **CRITICAL!** Select **`Iowa (us-central1)`**.
    *   **Schedule:** Set the schedule (e.g., `every 24 hours`).
    *   **Pub/Sub topic:** Set this to `daily-tick`. This must match the topic name in the Cloud Function.


### 3. Install Dependencies
If you haven't already, install the project dependencies:
```bash
npm install
```

### 4. Run the Development Servers
You need to run two servers concurrently: one for the Next.js frontend and one for the Genkit AI backend.

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

### 5. Open the App
Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

## Deployment

To share your app with others, you need to deploy it to a public URL. This project is set up to use Firebase App Hosting.

### Prerequisites

1.  **Install Firebase CLI:** If you don't have it, install it globally:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Log in to Firebase:**
    ```bash
    firebase login
    ```

### Deployment Steps

1.  **Initialize App Hosting (if not already done):**
    If this is your first time deploying, you might need to link your project to Firebase. Run:
    ```bash
    firebase init apphosting
    ```
    Follow the prompts to select your Firebase project.

2.  **Build your app for production:**
    ```bash
    npm run build
    ```

3.  **Deploy to Firebase:**
    Run the deploy command:
    ```bash
    firebase deploy --only apphosting
    ```

After the command completes, it will output the public URL for your deployed application. You can share this link with your tester.
