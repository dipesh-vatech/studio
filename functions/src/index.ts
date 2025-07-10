/**
 * @fileOverview Firebase Cloud Functions for sending scheduled notifications.
 *
 * This file contains the backend logic for CollabFlow's notification system.
 * It uses a scheduled Cloud Function to check for upcoming deal deadlines
 * and creates email documents in a 'mail' collection, which can then be
 * processed by the Firebase Trigger Email extension.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Helper to format a Date object to a 'YYYY-MM-DD' string in UTC
const getUtcDateString = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

/**
 * A Pub/Sub triggered function that checks for upcoming deal deadlines.
 * This function is designed to be invoked by a Cloud Scheduler job.
 */
export const dailyDealReminderCheck = functions
  .region('us-central1')
  .pubsub.topic('daily-tick')
  .onRun(async (context) => {
    console.log('Running daily deal reminder check via Pub/Sub...');

    const now = new Date();
    
    const oneDayFromNowDate = new Date(now);
    oneDayFromNowDate.setDate(now.getDate() + 1);
    const oneDayFromNow = getUtcDateString(oneDayFromNowDate);
    
    const threeDaysFromNowDate = new Date(now);
    threeDaysFromNowDate.setDate(now.getDate() + 3);
    const threeDaysFromNow = getUtcDateString(threeDaysFromNowDate);
    
    console.log(
      `Checking for deals due on: ${oneDayFromNow} or ${threeDaysFromNow}`
    );

    const dealsSnapshot = await db
      .collection('deals')
      .where('status', 'in', ['Upcoming', 'In Progress'])
      .get();

    if (dealsSnapshot.empty) {
      console.log('No upcoming or in-progress deals found.');
      return null;
    }

    console.log(
      `Found ${dealsSnapshot.docs.length} potentially relevant deals to check.`
    );

    // Use a map to batch emails by user to avoid sending multiple emails
    const emailsToSend = new Map<string, {to: string; deals: any[]}>();

    for (const doc of dealsSnapshot.docs) {
      const deal = doc.data();
      // Ensure dueDate exists and has a toDate method (i.e., is a Firestore Timestamp)
      if (!deal.dueDate || typeof deal.dueDate.toDate !== 'function') {
        console.warn(`Deal ${doc.id} has invalid or missing dueDate.`);
        continue;
      }

      // Convert Firestore timestamp to a JS Date, then format to yyyy-MM-dd to compare dates only
      const dealDueDate = getUtcDateString(deal.dueDate.toDate());
      let daysUntilDue = -1;

      if (dealDueDate === oneDayFromNow) {
        daysUntilDue = 1;
      } else if (dealDueDate === threeDaysFromNow) {
        daysUntilDue = 3;
      }

      // Check if the deal is due in exactly 3 days or 1 day.
      if (daysUntilDue > 0) {
        const userSnapshot = await db.collection('users').doc(deal.userId).get();
        if (!userSnapshot.exists) continue;

        const user = userSnapshot.data();
        if (!user || !user.notificationSettings?.email?.dealReminders) continue;

        if (!emailsToSend.has(deal.userId)) {
          emailsToSend.set(deal.userId, {to: user.email, deals: []});
        }
        emailsToSend.get(deal.userId)!.deals.push({
          campaignName: deal.campaignName,
          daysUntilDue,
        });
      }
    }

    if (emailsToSend.size === 0) {
      console.log('No reminders to send today based on due dates.');
      return null;
    }

    // Create email documents in the 'mail' collection for the extension to pick up
    const emailPromises = Array.from(emailsToSend.values()).map(
      ({to, deals}) => {
        const subject = 'Upcoming Deal Deadlines on CollabFlow';
        const dealsListHtml = deals
          .map(
            d =>
              `<li><b>${d.campaignName}</b> is due in ${d.daysUntilDue} day(s).</li>`
          )
          .join('');

        const html = `
          <p>Hi there,</p>
          <p>This is a friendly reminder from CollabFlow about your upcoming deadlines:</p>
          <ul>${dealsListHtml}</ul>
          <p>Log in to your dashboard to view more details.</p>
          <p>Best,<br/>The CollabFlow Team</p>
        `;

        console.log(`Creating email document for: ${to}`);
        return db.collection('mail').add({
          to: [to],
          message: {
            subject,
            html,
          },
        });
      }
    );

    await Promise.all(emailPromises);
    console.log(`Successfully created ${emailPromises.length} email tasks.`);
    return null;
  });
