/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _publicCourse from "../_publicCourse.js";
import type * as adminAudit from "../adminAudit.js";
import type * as adminAuth from "../adminAuth.js";
import type * as adminBundles from "../adminBundles.js";
import type * as adminCourses from "../adminCourses.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as adminEnrollments from "../adminEnrollments.js";
import type * as adminLoyalty from "../adminLoyalty.js";
import type * as adminManagers from "../adminManagers.js";
import type * as adminOffers from "../adminOffers.js";
import type * as adminReviews from "../adminReviews.js";
import type * as adminUsers from "../adminUsers.js";
import type * as adminUtils from "../adminUtils.js";
import type * as bundleCampaigns from "../bundleCampaigns.js";
import type * as courseBatches from "../courseBatches.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as emailActions from "../emailActions.js";
import type * as emailActionsWithRateLimit from "../emailActionsWithRateLimit.js";
import type * as googleSheets from "../googleSheets.js";
import type * as image from "../image.js";
import type * as loyaltySearch from "../loyaltySearch.js";
import type * as mindPoints from "../mindPoints.js";
import type * as myFunctions from "../myFunctions.js";
import type * as rateLimit from "../rateLimit.js";
import type * as testOffer from "../testOffer.js";
import type * as viewer from "../viewer.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  _publicCourse: typeof _publicCourse;
  adminAudit: typeof adminAudit;
  adminAuth: typeof adminAuth;
  adminBundles: typeof adminBundles;
  adminCourses: typeof adminCourses;
  adminDashboard: typeof adminDashboard;
  adminEnrollments: typeof adminEnrollments;
  adminLoyalty: typeof adminLoyalty;
  adminManagers: typeof adminManagers;
  adminOffers: typeof adminOffers;
  adminReviews: typeof adminReviews;
  adminUsers: typeof adminUsers;
  adminUtils: typeof adminUtils;
  bundleCampaigns: typeof bundleCampaigns;
  courseBatches: typeof courseBatches;
  courses: typeof courses;
  crons: typeof crons;
  emailActions: typeof emailActions;
  emailActionsWithRateLimit: typeof emailActionsWithRateLimit;
  googleSheets: typeof googleSheets;
  image: typeof image;
  loyaltySearch: typeof loyaltySearch;
  mindPoints: typeof mindPoints;
  myFunctions: typeof myFunctions;
  rateLimit: typeof rateLimit;
  testOffer: typeof testOffer;
  viewer: typeof viewer;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
