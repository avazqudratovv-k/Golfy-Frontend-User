import "i18next";

// t() always returns a string (matches `returnNull: false` in i18n/index.ts)
declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false;
  }
}
