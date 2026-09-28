export interface ItemMasterView {
  itemId: string;
  itemName: string;
  barcode: string;
  code: string;
  itemGroup: string;
  itemCategory: string;
  unit?: string;
  price?: number;
  uomId?: string
  convQty?: number
}

export interface ItemMasterSearch {
  name: string;
  code: string;
  barcode: string;
  itemGroupId: string;
  itemCategoryId: string;
  locationId: string
  page: number;
  size: number;
}

export const itemMasterSearchInitialValue: ItemMasterSearch = {
  name: "",
  code: "",
  barcode: "",
  itemGroupId: "",
  itemCategoryId: "",
  locationId: "",
  page: 0,
  size: 25,
};
