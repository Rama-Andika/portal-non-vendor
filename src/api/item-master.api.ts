import type {
  ItemMasterSearch,
  ItemMasterView,
} from "@/types/item-master.interface";
import type { TResponse } from "@/types/response.type";
import axiosInstance from "./axiosInstance";

export const getItemMasters = async (
  search: ItemMasterSearch,
): Promise<TResponse<ItemMasterView[]>> => {
  //search.page = search.page - 1;
  const response = await axiosInstance.get("/api/item-masters", {
    params: search,
  });
  const result: TResponse<ItemMasterView[]> = response.data;
  return result;
};

export const getItemMastersWithPrice = async (
  search: ItemMasterSearch,
): Promise<TResponse<ItemMasterView[]>> => {
  //search.page = search.page - 1;
  const response = await axiosInstance.get("/api/item-masters/with-price", {
    params: search,
  });
  const result: TResponse<ItemMasterView[]> = response.data;
  return result;
};

export const getItemMastersPlayground = async (): Promise<ItemMasterView[]> => {
  const response = await axiosInstance.get("/api/playground/item-masters");
  const result: TResponse<ItemMasterView[]> = response.data;
  return result.data ?? [];
};

export const getItemMasterPrice = async (
  itemId: string,
  locationId: string,
): Promise<number> => {
  const response = await axiosInstance.post("/api/item-master/price", {
    itemMasterId: itemId,
    locationId: locationId,
  });
  const result: TResponse<number> = response.data;
  return result.data ?? 0;
};
