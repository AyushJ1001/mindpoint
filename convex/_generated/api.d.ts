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
import type * as courses from "../courses.js";
import type * as emailActions from "../emailActions.js";
import type * as emailActionsWithRateLimit from "../emailActionsWithRateLimit.js";
import type * as googleSheets from "../googleSheets.js";
import type * as image from "../image.js";
import type * as myFunctions from "../myFunctions.js";
import type * as rateLimit from "../rateLimit.js";
import type * as testOffer from "../testOffer.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  courses: typeof courses;
  emailActions: typeof emailActions;
  emailActionsWithRateLimit: typeof emailActionsWithRateLimit;
  googleSheets: typeof googleSheets;
  image: typeof image;
  myFunctions: typeof myFunctions;
  rateLimit: typeof rateLimit;
  testOffer: typeof testOffer;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
