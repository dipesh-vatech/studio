# **App Name**: CollabFlow

## Core Features:

- Authentication: Implement login with Google using Firebase Authentication. Store user metadata (name, email, profile type: influencer/brand) in Firestore.
- Contract Parsing (PDF + OCR): Allow users to upload PDF contracts. Extract key details using OCR: Brand name, Campaign start/end dates, Deliverables (e.g., 2 Instagram posts, 1 Story), Payment amount and due date. Store extracted contract info in Firestore linked to the user.
- Reminders & Notifications: Display reminders inside a dashboard. Schedule Cloud Functions to monitor upcoming due dates (posts, invoices). Trigger email or in-app notifications 3 days and 1 day before deadlines.
- Deal Tracker Dashboard: Display a list of collaborations with filtering options for upcoming, overdue, and paid/unpaid statuses. Highlight contracts with missing data or unresolved payments.
- Pitch Generator: Let users input past content data (followers, top posts, engagement rate). Use AI tool to generate branded pitch emails tailored to that user’s niche and stats. The AI tool will decide which metrics to incorporate from the past content data.
- Audience Engagement Summary: Allow users to manually enter social post performance (likes, comments, saves). Display visual summaries and tag posts that led to sponsorship conversions.

## Style Guidelines:

- Primary color: Saturated blue (#4285F4) to evoke trust and professionalism, aligning with collaboration and social media themes.
- Background color: Light gray (#F0F2F5), offering a neutral backdrop that ensures readability and reduces visual fatigue.
- Accent color: Vivid violet (#A259FF) for interactive elements and highlights.
- Body and headline font: 'Inter' (sans-serif) for a modern, clean, and easily readable design.
- Mobile-responsive design utilizing a flexible grid system.
- Use clear, modern icons to represent collaboration status, reminders, and data metrics.