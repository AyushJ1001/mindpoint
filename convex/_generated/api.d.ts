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
import type * as _shared_lmsActivation from "../_shared/lmsActivation.js";
import type * as _shared_lmsCertificate from "../_shared/lmsCertificate.js";
import type * as _shared_lmsCourseScope from "../_shared/lmsCourseScope.js";
import type * as _shared_lmsDiscussion from "../_shared/lmsDiscussion.js";
import type * as _shared_lmsFeedback from "../_shared/lmsFeedback.js";
import type * as _shared_lmsQuiz from "../_shared/lmsQuiz.js";
import type * as _shared_mindPoints from "../_shared/mindPoints.js";
import type * as _shared_result from "../_shared/result.js";
import type * as adminAudit from "../adminAudit.js";
import type * as adminAuth from "../adminAuth.js";
import type * as adminBundles from "../adminBundles.js";
import type * as adminCoupons from "../adminCoupons.js";
import type * as adminCourses from "../adminCourses.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as adminEnrollments from "../adminEnrollments.js";
import type * as adminLeads from "../adminLeads.js";
import type * as adminLoyalty from "../adminLoyalty.js";
import type * as adminManagers from "../adminManagers.js";
import type * as adminOffers from "../adminOffers.js";
import type * as adminReviews from "../adminReviews.js";
import type * as adminUsers from "../adminUsers.js";
import type * as adminUtils from "../adminUtils.js";
import type * as bootstrapCbtRebtCbmt from "../bootstrapCbtRebtCbmt.js";
import type * as bootstrapJanuaryCohort from "../bootstrapJanuaryCohort.js";
import type * as bundleCampaigns from "../bundleCampaigns.js";
import type * as checkout from "../checkout.js";
import type * as courseBatchHelpers from "../courseBatchHelpers.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as emailActions from "../emailActions.js";
import type * as emailActionsWithRateLimit from "../emailActionsWithRateLimit.js";
import type * as googleSheets from "../googleSheets.js";
import type * as image from "../image.js";
import type * as leads from "../leads.js";
import type * as lms from "../lms.js";
import type * as lmsAdmin from "../lmsAdmin.js";
import type * as lmsCompletion from "../lmsCompletion.js";
import type * as lmsFaculty from "../lmsFaculty.js";
import type * as loyaltySearch from "../loyaltySearch.js";
import type * as migrations from "../migrations.js";
import type * as mindPoints from "../mindPoints.js";
import type * as myFunctions from "../myFunctions.js";
import type * as rateLimit from "../rateLimit.js";
import type * as siteContent from "../siteContent.js";
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
  "_shared/lmsActivation": typeof _shared_lmsActivation;
  "_shared/lmsCertificate": typeof _shared_lmsCertificate;
  "_shared/lmsCourseScope": typeof _shared_lmsCourseScope;
  "_shared/lmsDiscussion": typeof _shared_lmsDiscussion;
  "_shared/lmsFeedback": typeof _shared_lmsFeedback;
  "_shared/lmsQuiz": typeof _shared_lmsQuiz;
  "_shared/mindPoints": typeof _shared_mindPoints;
  "_shared/result": typeof _shared_result;
  adminAudit: typeof adminAudit;
  adminAuth: typeof adminAuth;
  adminBundles: typeof adminBundles;
  adminCoupons: typeof adminCoupons;
  adminCourses: typeof adminCourses;
  adminDashboard: typeof adminDashboard;
  adminEnrollments: typeof adminEnrollments;
  adminLeads: typeof adminLeads;
  adminLoyalty: typeof adminLoyalty;
  adminManagers: typeof adminManagers;
  adminOffers: typeof adminOffers;
  adminReviews: typeof adminReviews;
  adminUsers: typeof adminUsers;
  adminUtils: typeof adminUtils;
  bootstrapCbtRebtCbmt: typeof bootstrapCbtRebtCbmt;
  bootstrapJanuaryCohort: typeof bootstrapJanuaryCohort;
  bundleCampaigns: typeof bundleCampaigns;
  checkout: typeof checkout;
  courseBatchHelpers: typeof courseBatchHelpers;
  courses: typeof courses;
  crons: typeof crons;
  emailActions: typeof emailActions;
  emailActionsWithRateLimit: typeof emailActionsWithRateLimit;
  googleSheets: typeof googleSheets;
  image: typeof image;
  leads: typeof leads;
  lms: typeof lms;
  lmsAdmin: typeof lmsAdmin;
  lmsCompletion: typeof lmsCompletion;
  lmsFaculty: typeof lmsFaculty;
  loyaltySearch: typeof loyaltySearch;
  migrations: typeof migrations;
  mindPoints: typeof mindPoints;
  myFunctions: typeof myFunctions;
  rateLimit: typeof rateLimit;
  siteContent: typeof siteContent;
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
