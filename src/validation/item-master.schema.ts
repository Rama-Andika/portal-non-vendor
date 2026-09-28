import z from "zod";

export const ItemMasterSearchSchema = z.object({
  name: z.string().catch(""),
  code: z.string().catch(""),
  barcode: z.string().catch(""),
  itemGroupId: z.string().catch(""),
  itemCategoryId: z.string().catch(""),
  locationId: z.string().catch(""),
  page: z.number().catch(9),
  size: z.number().catch(25),
});

export type ItemMasterSearchType = z.infer<typeof ItemMasterSearchSchema>;

export const ItemMasterSearchInitialValue: ItemMasterSearchType = {
  name: "",
  code: "",
  barcode: "",
  itemGroupId: "",
  itemCategoryId: "",
  locationId: "",
  page: 0,
  size: 25,
}
