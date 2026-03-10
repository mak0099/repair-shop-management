import { ShopProfile } from "../shop-profile.schema";

export const shopProfileMock: ShopProfile = {
  id: "shop-001",
  name: "Telefix IT",
  ownerName: "Muzaddad Al Mamun",
  phone: "01700000000",
  email: "contact@telefix.it",
  address: "Level 4, Block C, Jamuna Future Park, Dhaka",
  logoUrl: "/images/logo.png",
  bannerLogoUrl: "/images/banner-logo.png",
  binNumber: "123456789-001",
  currency: "EUR",
  invoiceFooterMessage: "Thank you for shopping with us! No return without invoice.",
  website: "https://telefix.it",
  taxRate: 5,
  bankAccountInfo: "Bank: Dutch Bangla Bank\nAccount: 123.123.1234\nBranch: Gulshan",
  returnPolicy: "Items can be returned within 7 days if unused and in original packaging.",
  termsAndConditions: "1. All sales are final.\n2. Warranty covers manufacturer defects only.",
  dateFormat: "dd MMM yyyy",
  slogan: "La tua felicità, la nostra priorità",
};