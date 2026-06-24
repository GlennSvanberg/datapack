/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ingest from "../ingest.js";
import type * as ingestActions from "../ingestActions.js";
import type * as lib_aggregates from "../lib/aggregates.js";
import type * as lib_ingestFull from "../lib/ingestFull.js";
import type * as lib_packManifest from "../lib/packManifest.js";
import type * as lib_telemetryPayload from "../lib/telemetryPayload.js";
import type * as packs from "../packs.js";
import type * as seed from "../seed.js";
import type * as seedFixtures from "../seedFixtures.js";
import type * as telemetry from "../telemetry.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ingest: typeof ingest;
  ingestActions: typeof ingestActions;
  "lib/aggregates": typeof lib_aggregates;
  "lib/ingestFull": typeof lib_ingestFull;
  "lib/packManifest": typeof lib_packManifest;
  "lib/telemetryPayload": typeof lib_telemetryPayload;
  packs: typeof packs;
  seed: typeof seed;
  seedFixtures: typeof seedFixtures;
  telemetry: typeof telemetry;
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
