import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import applyCatalogItemFilters from "../utils/applyCatalogItemFilters.js";

/**
 * @name catalogItems
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.searchQuery] - Optional text search query
 * @param {String[]} [params.shopIds] - Shop IDs to include (OR)
 * @param {String[]} [params.tags] - Tag IDs to include (OR)
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItems(context, { searchQuery, shopIds, tagIds, catalogBooleanFilters } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  // if ((!shopIds || shopIds.length === 0) && (!tagIds || tagIds.length === 0)) {
  //   throw new ReactionError("invalid-param", "You must provide tagIds or shopIds or both");
  // }

  const queryResponse = applyCatalogItemFilters(context, { searchQuery, shopIds, tagIds, catalogBooleanFilters });

  return Catalog.find(queryResponse);
}
