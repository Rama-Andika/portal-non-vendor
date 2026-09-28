import "i18next";
import commonID from "../locales/id/common.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof commonID;
    };
  }
}
