
# CollabFlow

This is a NextJS application for managing influencer collaborations, built with Firebase and Genkit.

## Getting Started

### 1. Clone the Repository
First, clone the project to your local machine using a terminal or command prompt.
```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```
**Note:** Replace `https://github.com/your-username/your-repository-name.git` with your actual repository URL.

### 2. Set Up Environment Variables

Before running the application, you need to configure your local environment by providing API keys. **This project is configured to run on the free tiers of Firebase and Google AI, making it free to deploy and test for most feedback-gathering scenarios.**

Open the `.env` file in the root of the project and add your keys. **Note:** Environment variable names are case-sensitive. Please use the exact names shown below.

*   **Firebase Keys:** You can find these values in your [Firebase project settings](https://console.firebase.google.com/). Go to Project Overview > Project settings (the gear icon) > General, and find your web app configuration.

*   **Google AI (Gemini) Key:** You can generate a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The correct variable name for this key is `GOOGLE_API_KEY`.

*   **Admin Email (Optional):** To designate an admin user who bypasses plan restrictions, set the `NEXT_PUBLIC_ADMIN_EMAIL` variable to their email address.

The `.env` file has placeholders for all the required keys:
```
# Firebase Configuration
# These keys are safe to be public.
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Admin User Email (Optional)
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Google AI (Gemini) API Key (Kept server-side)
GOOGLE_API_KEY=...
```

### 3. Configure Firebase Extensions

This project relies on two Firebase Extensions. You must install and configure them from the Firebase Console.

*   Go to **Build > Extensions > Explore extensions** in your Firebase project.

#### A. Trigger Email Extension

This extension is required to send notification emails.

1.  **Install:** Find and install the "Trigger Email" extension.
2.  **Configuration:** During installation, you will be asked for the following:
    *   **Cloud Functions location:** **CRITICAL!** Select **`Iowa (us-central1)`**.
    *   **Firestore Instance Location:** **CRITICAL!** Select **`Multi-region (United States)`** from the dropdown. This corresponds to `nam5` and must match your database's actual location.
    *   **Mail Collection:** Set this to `mail`. This must match the collection name used in the Cloud Function.
    *   **Default FROM address:** Enter a verified sender email from your email provider (e.g., `noreply@yourdomain.com`).
    *   **SMTP Connection URI:** This is the most critical step. You need to provide the connection details for your email provider.

##### SMTP Configuration

To avoid authentication errors, we strongly recommend embedding your SMTP key directly into the connection URI.
Your final URI should look like this: `smtps://your.login@email.com:the-real-smtp-key@smtp-relay.brevo.com:465`

#### B. Cloud Scheduler Extension

This extension is required to run the daily notification check.

1.  **Install:** Find and install the "Trigger a function on a schedule with Cloud Scheduler" extension.
2.  **Configuration:**
    *   **Cloud Functions location:** **CRITICAL!** Select **`Iowa (us-central1)`**.
    *   **Schedule:** Set the schedule (e.g., `every 24 hours`).
    *   **Pub/Sub topic:** Set this to `daily-tick`. This must match the topic name in the Cloud Function.

### 4. Permissions Troubleshooting

If you see a permission error during extension installation, add the **`Service Account User`** role to your user account in the [Google Cloud IAM page](https://console.cloud.google.com/iam-admin/iam).

### 5. Install Dependencies
```bash
npm install
```

### 6. Run the Development Servers
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

### 7. Open the App
Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

## Deployment to the Web

To share your app, you can deploy it to a public URL with Firebase App Hosting.

### 1. Install Firebase CLI (One-Time Setup)
If you don't have the Firebase Command Line Interface (CLI) installed, open your terminal and run this command. This will install the tool globally on your system so you can deploy from any project.
```bash
npm install -g firebase-tools
```

### 2. Log In to Firebase
Connect the CLI to your Firebase account. This will open a browser window for you to sign in.
```bash
firebase login
```

### 3. Build Your App for Production
This command prepares your Next.js application for deployment by compiling and optimizing it.
```bash
npm run build
```

### 4. Deploy to Firebase
Run the deploy command. If it's your first time, you may be asked to select your Firebase project.
```bash
firebase deploy --only apphosting
```

After the command completes, it will output the public URL for your deployed application. You can share this link with anyone!
