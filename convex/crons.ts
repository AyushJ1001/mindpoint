import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Disable expired bundle campaigns every 10 minutes.
// This ensures Convex subscriptions re-evaluate when a campaign's endDate
// passes, because the document change (enabled → false) triggers updates
// for all clients subscribed to active-campaign queries.
crons.interval(
  "disable expired bundle campaigns",
  { minutes: 10 },
  internal.bundleCampaigns.disableExpiredCampaigns,
  {},
);

// Reconcile scheduled offer campaigns onto courses every five minutes. This is
// what makes a campaign start and expire without a deploy: the run writes the
// offer while the window is open and clears it afterwards, so the standard fee
// comes back on its own.
crons.interval(
  "reconcile offer campaigns",
  { minutes: 5 },
  internal.promoCampaigns.reconcileCampaigns,
  {},
);

export default crons;
