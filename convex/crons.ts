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

export default crons;
