import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server';

export const catalogSearchParams = {
  category: parseAsString.withDefault(''),
  sort: parseAsString.withDefault('newest'),
  search: parseAsString.withDefault(''),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
};

export const loadSearchParams = createSearchParamsCache(catalogSearchParams);
