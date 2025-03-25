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
import type * as aptitudeTests from "../aptitudeTests.js";
import type * as auth from "../auth.js";
import type * as colleges from "../colleges.js";
import type * as counselors from "../counselors.js";
import type * as migrations_add_careerfields_to_options from "../migrations/add_careerfields_to_options.js";
import type * as mutations from "../mutations.js";
import type * as queries from "../queries.js";
import type * as systemEvents from "../systemEvents.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aptitudeTests: typeof aptitudeTests;
  auth: typeof auth;
  colleges: typeof colleges;
  counselors: typeof counselors;
  "migrations/add_careerfields_to_options": typeof migrations_add_careerfields_to_options;
  mutations: typeof mutations;
  queries: typeof queries;
  systemEvents: typeof systemEvents;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
