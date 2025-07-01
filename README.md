# CollabFlow

This is a NextJS application for managing influencer collaborations, built with Firebase and Genkit.

## Getting Started

### 1. Set Up Environment Variables

Before running the application, you need to configure your local environment by providing API keys.

Open the `.env` file in the root of the project and add your keys. **Note:** Environment variable names are case-sensitive. Please use the exact names shown below.

*   **Firebase Keys:** You can find these values in your [Firebase project settings](https://console.firebase.google.com/). Go to Project Overview > Project settings (the gear icon) > General, and find your web app configuration.

*   **Google AI (Gemini) Key:** You can generate a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The correct variable name for this key is `GOOGLE_API_KEY`.

The `.env` file has placeholders for all the required keys:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
...

# Google AI (Gemini) API Key
GOOGLE_API_KEY=...
```

### 2. Install Dependencies
If you haven't already, install the project dependencies:
```bash
npm install
```

### 3. Run the Development Servers
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

### 4. Open the App
Navigate to [http://localhost:9002](http://localhost:9002) in your browser.
