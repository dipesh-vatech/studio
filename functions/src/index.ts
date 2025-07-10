
/**
 * @fileOverview Firebase Cloud Functions for sending scheduled notifications.
 *
 * This file contains the backend logic for CollabFlow's notification system.
 * It uses a scheduled Cloud Function to check for upcoming deal deadlines
 * and creates email documents in a 'mail' collection, which can then be
 * processed by the Firebase Trigger Email extension.
 */

import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

// Initialize the Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * A Pub/Sub triggered function that runs daily to check for deal deadlines.
 * This function is designed to be invoked by a Cloud Scheduler job.
 */
export const dailydealremindercheck = onMessagePublished(
  {
    topic: 'daily-tick',
    region: 'nam5', // Ensure this matches your project's region
    memory: '256MiB',
  },
  async (event) => {
    logger.info('Running daily deal reminder check via Pub/Sub...');

    const now = new Date();
    // Use a map to batch emails by user to avoid sending multiple emails
    const emailsToSend = new Map<string, { to: string; deals: any[] }>();

    // Helper function to process deals for a given number of days from now
    const processDealsForDay = async (daysFromNow: 1 | 3) => {
      // Calculate the start and end of the target day in UTC
      const targetDateStart = new Date(now);
      targetDateStart.setUTCHours(0, 0, 0, 0);
      targetDateStart.setUTCDate(targetDateStart.getUTCDate() + daysFromNow);

      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setUTCHours(23, 59, 59, 999);

      logger.info(`Checking for deals due between ${targetDateStart.toISOString()} and ${targetDateEnd.toISOString()}`);
      
      const dealsSnapshot = await db
        .collection('deals')
        .where('status', 'in', ['Upcoming', 'In Progress'])
        .where('dueDate', '>=', targetDateStart)
        .where('dueDate', '<=', targetDateEnd)
        .get();

      if (dealsSnapshot.empty) {
        logger.info(`No deals found with a due date in ${daysFromNow} day(s).`);
        return;
      }

      logger.info(`Found ${dealsSnapshot.docs.length} deals due in ${daysFromNow} day(s).`);

      for (const doc of dealsSnapshot.docs) {
        const deal = doc.data();
        logger.info(`Processing deal: ${deal.campaignName} (ID: ${doc.id}) for user ${deal.userId}`);

        const userSnapshot = await db.collection('users').doc(deal.userId).get();
        if (!userSnapshot.exists) {
          logger.warn(`User ${deal.userId} not found for deal ${doc.id}.`);
          continue;
        }

        const user = userSnapshot.data();
        if (!user || !user.email) {
          logger.warn(`User ${deal.userId} for deal ${doc.id} is missing an email address.`);
          continue;
        }

        if (!user.notificationSettings?.email?.dealReminders) {
          logger.info(`User ${deal.userId} has reminders disabled for deal ${doc.id}.`);
          continue;
        }

        if (!emailsToSend.has(deal.userId)) {
          emailsToSend.set(deal.userId, { to: user.email, deals: [] });
        }

        emailsToSend.get(deal.userId)!.deals.push({
          campaignName: deal.campaignName,
          daysUntilDue: daysFromNow,
        });
      }
    };

    // Run checks for 1 and 3 days from now
    await processDealsForDay(1);
    await processDealsForDay(3);
    
    if (emailsToSend.size === 0) {
      logger.info('No reminders to send today based on due dates and user preferences.');
      return;
    }

    // Create email documents in the 'mail' collection for the extension to pick up
    const emailPromises = Array.from(emailsToSend.values()).map(
      ({ to, deals }) => {
        const subject = 'Upcoming Deal Deadlines on CollabFlow';
        const dealsListHtml = deals
          .map(
            (d) =>
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

        logger.info(`Creating email document for: ${to}`);
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
    logger.info(`Successfully created ${emailPromises.length} email tasks.`);
  }
);
