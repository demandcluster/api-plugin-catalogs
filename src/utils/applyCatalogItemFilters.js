import _ from "lodash";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const ArrayStringToArrayRegExp = (items) => items.map((item) => {
    const regex = new RegExp(`${item}`, "i");

    return regex;
});

const filters = new SimpleSchema({
    catalogBooleanFilters: {
        type: Object,
        optional: true,
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
    },
    vendors: {
        type: Array,
        optional: true
    },
    "vendors.$": {
        type: String
    },
    colors: {
        type: Array,
        optional: true
    },
    "colors.$": String,
    sizes: {
        type: Array,
        optional: true
    },
    "sizes.$": String,
    "minPrice": {
        type: Number,
        optional: true
    },
    "maxPrice": {
        type: Number,
        optional: true
    },
    "currencyCode": {
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

        if (catalogItemFilters.vendors) {
            Object.assign(selector, {
                "product.vendor": { $in: catalogItemFilters.vendors }
            });
        }

        if (catalogItemFilters.colors) {
            Object.assign(selector, {
                "product.variants.color": { $in: ArrayStringToArrayRegExp(catalogItemFilters.colors) }
            });
        }

        if (catalogItemFilters.sizes) {
            Object.assign(selector, {
                "product.variants.size": { $in: ArrayStringToArrayRegExp(catalogItemFilters.sizes) }
            });
        }

        if (catalogItemFilters.minPrice && !catalogItemFilters.maxPrice) {
            if (!catalogItemFilters.currencyCode) throw new ReactionError("bad-request", 'param "currencyCode" is required to filter by range price');
            const key = `pricing.${catalogItemFilters.currencyCode}.price`;

            Object.assign(selector, {
                "product.variants.options": {
                    $elemMatch: {
                        [key]: { $gt: catalogItemFilters.minPrice }
                    }
                }
            });// selector.product.variants.options.$elemMatch[key] = { $gt: catalogItemFilters.minPrice };
        }

        if (!catalogItemFilters.minPrice && catalogItemFilters.maxPrice) {
            if (!catalogItemFilters.currencyCode) throw new ReactionError("bad-request", 'param "currencyCode" is required to filter by price range');
            const key = `pricing.${catalogItemFilters.currencyCode}.price`;

            Object.assign(selector, {
                "product.variants.options": {
                    $elemMatch: {
                        [key]: { $lt: catalogItemFilters.maxPrice }
                    }
                }
            });
        }

        if (catalogItemFilters.minPrice && catalogItemFilters.maxPrice) {
            if (!catalogItemFilters.currencyCode) throw new ReactionError("bad-request", 'param "currencyCode" is required to filter by price range');
            const key = `pricing.${catalogItemFilters.currencyCode}.price`;

            Object.assign(selector, {
                "product.variants.options": {
                    $elemMatch: {
                        [key]: { $gt: catalogItemFilters.minPrice, $lt: catalogItemFilters.maxPrice }
                    }
                }
            });
        }
    }

    return selector;
}