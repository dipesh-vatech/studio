"use strict";
/**
 * @fileOverview Firebase Cloud Functions for sending scheduled notifications.
 *
 * This file contains the backend logic for CollabFlow's notification system.
 * It uses a scheduled Cloud Function to check for upcoming deal deadlines
 * and creates email documents in a 'mail' collection, which can then be
 * processed by the Firebase Trigger Email extension.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyDealReminderCheck = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const date_fns_1 = require("date-fns");
// Initialize the Firebase Admin SDK
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * A scheduled function that runs once every day at midnight.
 * It checks for all deals that are due in 3 days or 1 day and sends
 * an email reminder to the user if they have enabled notifications.
 */
exports.dailyDealReminderCheck = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
    var _a, _b;
    console.log("Running daily deal reminder check...");
    const now = new Date();
    const dealsSnapshot = await db
        .collection("deals")
        .where("status", "in", ["Upcoming", "In Progress"])
        .get();
    if (dealsSnapshot.empty) {
        console.log("No upcoming or in-progress deals found.");
        return null;
    }
    // Use a map to batch emails by user to avoid sending multiple emails
    const emailsToSend = new Map();
    for (const doc of dealsSnapshot.docs) {
        const deal = doc.data();
        // Ensure dueDate exists and has a toDate method (i.e., is a Firestore Timestamp)
        if (!deal.dueDate || typeof deal.dueDate.toDate !== 'function') {
            console.warn(`Deal ${doc.id} has invalid or missing dueDate.`);
            continue;
        }
        const dueDate = (0, date_fns_1.parseISO)(deal.dueDate.toDate().toISOString());
        const daysUntilDue = (0, date_fns_1.differenceInDays)(dueDate, now);
        // Check if the deal is due in 3 days or 1 day
        if (daysUntilDue === 3 || daysUntilDue === 1) {
            const userSnapshot = await db.collection("users").doc(deal.userId).get();
            if (!userSnapshot.exists)
                continue;
            const user = userSnapshot.data();
            if (!user || !((_b = (_a = user.notificationSettings) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.dealReminders))
                continue;
            if (!emailsToSend.has(deal.userId)) {
                emailsToSend.set(deal.userId, { to: user.email, deals: [] });
            }
            emailsToSend.get(deal.userId).deals.push({
                campaignName: deal.campaignName,
                daysUntilDue,
            });
        }
    }
    if (emailsToSend.size === 0) {
        console.log("No reminders to send today.");
        return null;
    }
    // Create email documents in the 'mail' collection
    const emailPromises = Array.from(emailsToSend.values()).map(({ to, deals }) => {
        const subject = "Upcoming Deal Deadlines on CollabFlow";
        const dealsListHtml = deals
            .map((d) => `<li><b>${d.campaignName}</b> is due in ${d.daysUntilDue} day(s).</li>`)
            .join("");
        const html = `
          <p>Hi there,</p>
          <p>This is a friendly reminder from CollabFlow about your upcoming deadlines:</p>
          <ul>${dealsListHtml}</ul>
          <p>Log in to your dashboard to view more details.</p>
          <p>Best,<br/>The CollabFlow Team</p>
        `;
        console.log(`Creating email document for: ${to}`);
        return db.collection("mail").add({
            to: [to],
            message: {
                subject,
                html,
            },
        });
    });
    await Promise.all(emailPromises);
    console.log(`Successfully created ${emailPromises.length} email tasks.`);
    return null;
});
//# sourceMappingURL=index.js.map