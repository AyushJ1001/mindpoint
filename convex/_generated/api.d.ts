/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _publicCourse from "../_publicCourse.js";
import type * as _shared_checkout from "../_shared/checkout.js";
import type * as _shared_emailActionResult from "../_shared/emailActionResult.js";
import type * as _shared_emailDelivery from "../_shared/emailDelivery.js";
import type * as _shared_enrollment from "../_shared/enrollment.js";
import type * as _shared_enrollmentSchedule from "../_shared/enrollmentSchedule.js";
import type * as _shared_enrollmentSheet from "../_shared/enrollmentSheet.js";
import type * as _shared_googleSheetsClient from "../_shared/googleSheetsClient.js";
import type * as _shared_mindPoints from "../_shared/mindPoints.js";
import type * as _shared_result from "../_shared/result.js";
import type * as adminAudit from "../adminAudit.js";
import type * as adminAuth from "../adminAuth.js";
import type * as adminBundles from "../adminBundles.js";
import type * as adminCoupons from "../adminCoupons.js";
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
import type * as checkout from "../checkout.js";
import type * as courseBatchHelpers from "../courseBatchHelpers.js";
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
import type * as viewer from "../viewer.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _publicCourse: typeof _publicCourse;
  "_shared/checkout": typeof _shared_checkout;
  "_shared/emailActionResult": typeof _shared_emailActionResult;
  "_shared/emailDelivery": typeof _shared_emailDelivery;
  "_shared/enrollment": typeof _shared_enrollment;
  "_shared/enrollmentSchedule": typeof _shared_enrollmentSchedule;
  "_shared/enrollmentSheet": typeof _shared_enrollmentSheet;
  "_shared/googleSheetsClient": typeof _shared_googleSheetsClient;
  "_shared/mindPoints": typeof _shared_mindPoints;
  "_shared/result": typeof _shared_result;
  adminAudit: typeof adminAudit;
  adminAuth: typeof adminAuth;
  adminBundles: typeof adminBundles;
  adminCoupons: typeof adminCoupons;
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
  checkout: typeof checkout;
  courseBatchHelpers: typeof courseBatchHelpers;
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
  viewer: typeof viewer;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
