import {
  getItemMasterPrice,
  getItemMasters,
  getItemMastersPlayground,
  getItemMastersWithPrice,
} from "@/api/item-master.api";
import type {
  ItemMasterSearch,
  ItemMasterView,
} from "@/types/item-master.interface";
import type { TResponse } from "@/types/response.type";
import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export const itemMasterKeys = {
  all: ["item-masters"] as const,
  lists: () => [...itemMasterKeys.all, "list"] as const,
  list: (search: ItemMasterSearch) => [...itemMasterKeys.lists(), search] as const,
  withPriceLists: () => [...itemMasterKeys.all, "with-price", "list"] as const,
  withPriceList: (search: ItemMasterSearch) =>
    [...itemMasterKeys.withPriceLists(), search] as const,
  playground: () => [...itemMasterKeys.all, "playground"] as const,
  prices: () => [...itemMasterKeys.all, "price"] as const,
  price: (itemMasterId: string, locationId: string) =>
    [...itemMasterKeys.prices(), itemMasterId, locationId] as const,
};

export const itemMasterQueries = {
  all: (search: ItemMasterSearch) =>
    queryOptions({
      queryKey: itemMasterKeys.list(search),
      queryFn: () => getItemMasters(search),
      placeholderData: keepPreviousData,
    }),
  allWithPrice: (
    search: ItemMasterSearch,
    options?: Omit<
      UseQueryOptions<TResponse<ItemMasterView[]>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    queryOptions({
      queryKey: itemMasterKeys.withPriceList(search),
      queryFn: () => getItemMastersWithPrice(search),
      placeholderData: keepPreviousData,
      ...options,
    }),
  playground: () =>
    queryOptions({
      queryKey: itemMasterKeys.playground(),
      queryFn: getItemMastersPlayground,
      staleTime: 5 * 60 * 1000, //5 minutes,
    }),
  price: (itemMasterId: string, locationId: string) =>
    queryOptions({
      queryKey: itemMasterKeys.price(itemMasterId, locationId),
      queryFn: () => getItemMasterPrice(itemMasterId, locationId),
      staleTime: 2 * 60 * 1000, //5 minutes
      enabled: !!itemMasterId && !!locationId,
    }),
};
