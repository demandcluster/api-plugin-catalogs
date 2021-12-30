import _ from "lodash";
import SimpleSchema from "simpl-schema";

const filters = new SimpleSchema({
    catalogBooleanFilters: {
        type: Array,
        optional: true
    },
    "catalogBooleanFilters.$": {
        type: Object,
        blackbox: true
    },
    shopIds: {
        type: Array,
        optional: true
    },
    "shopIds.$": String,
    tagIds: {
        type: Array,
        optional: true
    },
    "tagIds.$": String,
    searchQuery: {
        type: String,
        optional: true
    }
});

/**
 * @name applyCatalogItemFilters
 * @summary Builds a selector for Catalog collection, given a set of filters
 * @private
 * @param {Object} context- an object containing the per-request state
 * @param {Object} catalogItemFilters - See filters schema above
 * @returns {Object} selector
 */
export default function applyCatalogItemFilters(context, catalogItemFilters) {
    //if there are filter/params that don't match the schema
    filters.validate(catalogItemFilters);

    // Init default selector
    const selector = {
        "product.isDeleted": { $ne: true },
        "product.isVisible": true,
        ...catalogItemFilters.catalogBooleanFilters
    };

    if (catalogItemFilters) {

        if (catalogItemFilters.shopIds) {
            Object.assign(selector, {
                shopId: { $in: catalogItemFilters.shopIds }
            });
        }

        if (catalogItemFilters.tagIds) {
            Object.assign(selector, {
                "product.tagIds": { $in: catalogItemFilters.tagIds }
            });
        }

        if (catalogItemFilters.searchQuery) {
            Object.assign(selector, {
                $or: [
                    {
                        "product.pageTitle": { '$regex': _.escapeRegExp(catalogItemFilters.searchQuery), '$options': 'i' }
                    },
                    {
                        "product.description": { '$regex': _.escapeRegExp(catalogItemFilters.searchQuery), '$options': 'i' }
                    },
                ]
            })
        }
    }

    return selector;
}