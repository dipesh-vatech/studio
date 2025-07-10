
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
 * A helper function to get a date string in YYYY-MM-DD format from a Date object.
 * It uses UTC methods to avoid timezone issues.
 * @param {Date} date The date to format.
 * @returns {string} The formatted date string.
 */
const getUtcDateString = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * A Pub/Sub triggered function that runs daily to check for deal deadlines.
 * This function is designed to be invoked by a Cloud Scheduler job.
 */
export const dailydealremindercheck = onMessagePublished(
  {
    topic: 'daily-tick',
    region: 'us-central1',
    memory: '256MiB',
  },
  async (event) => {
    logger.info('Running daily deal reminder check via Pub/Sub...');

    const now = new Date();
    
    // Calculate target dates in UTC
    const oneDayFromNowDate = new Date(now);
    oneDayFromNowDate.setUTCDate(now.getUTCDate() + 1);
    const oneDayFromNow = getUtcDateString(oneDayFromNowDate);
    
    const threeDaysFromNowDate = new Date(now);
    threeDaysFromNowDate.setUTCDate(now.getUTCDate() + 3);
    const threeDaysFromNow = getUtcDateString(threeDaysFromNowDate);
    
    logger.info(
      `Checking for deals due on: ${oneDayFromNow} or ${threeDaysFromNow}`
    );

    const dealsSnapshot = await db
      .collection('deals')
      .where('status', 'in', ['Upcoming', 'In Progress'])
      .get();

    if (dealsSnapshot.empty) {
      logger.info('No upcoming or in-progress deals found.');
      return;
    }

    logger.info(
      `Found ${dealsSnapshot.docs.length} potentially relevant deals to check.`
    );

    // Use a map to batch emails by user to avoid sending multiple emails
    const emailsToSend = new Map<string, {to: string; deals: any[]}>();

    for (const doc of dealsSnapshot.docs) {
      const deal = doc.data();
      // Ensure dueDate exists and has a toDate method (i.e., is a Firestore Timestamp)
      if (!deal.dueDate || typeof deal.dueDate.toDate !== 'function') {
        logger.warn(`Deal ${doc.id} has invalid or missing dueDate.`);
        continue;
      }

      const dealDueDate = getUtcDateString(deal.dueDate.toDate());
      let daysUntilDue = -1;

      if (dealDueDate === oneDayFromNow) {
        daysUntilDue = 1;
      } else if (dealDueDate === threeDaysFromNow) {
        daysUntilDue = 3;
      }
      
      if (daysUntilDue > 0) {
        logger.info(`Found a matching deal: ${deal.campaignName} due in ${daysUntilDue} day(s).`);
        const userSnapshot = await db.collection('users').doc(deal.userId).get();
        if (!userSnapshot.exists) {
            logger.info(`User ${deal.userId} not found for deal ${doc.id}.`);
            continue;
        }

        const user = userSnapshot.data();
        if (!user || !user.notificationSettings?.email?.dealReminders) {
            logger.info(`User ${deal.userId} has reminders disabled for deal ${doc.id}.`);
            continue;
        }

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
      logger.info('No reminders to send today based on due dates and user preferences.');
      return;
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
