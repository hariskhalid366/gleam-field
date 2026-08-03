import { createApi } from "@reduxjs/toolkit/query/react";
import { mockProducts } from "../../../mocks/user.mock";
import type { Address, AiPreferences, PaymentMethod, Product, User } from "../../../helpers/types";
import { USE_MOCK_DATA } from "../../../helpers/data";
import { baseQuery } from "../baseQuery";

const mockAddresses: Address[] = [
  { _id: "home", label: "Home", line1: "1247 Elm Street", city: "North Park", postcode: "92104", isDefault: true },
  { _id: "work", label: "Work", line1: "89 Market Lane", city: "Downtown", postcode: "92101" },
];
const mockPreferences: AiPreferences = { healthySwaps: true, budgetAlerts: true, weeklyBudget: 120, dietaryPreferences: [] };
const mockPaymentMethods: PaymentMethod[] = [
  { _id: "visa-4242", provider: "stripe", providerPaymentMethodId: "mock-pm-4242", brand: "Visa", last4: "4242", isDefault: true },
  { _id: "apple-pay", provider: "apple_pay", providerPaymentMethodId: "mock-apple-pay", brand: "Apple Pay" },
];
let wishlist = mockProducts.slice(0, 2);

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery,
  tagTypes: ["Addresses", "PaymentMethods", "Preferences", "Wishlist"],
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => "/mobile/profile",
    }),
    updateMobileProfile: builder.mutation<User, Partial<Pick<User, "name">> & { avatarUrl?: string }>({
      query: (body) => ({ url: "/mobile/profile", method: "PATCH", body }),
    }),
    getAddresses: builder.query<Address[], void>({
      queryFn: async (_arg, api, extraOptions) => USE_MOCK_DATA ? { data: mockAddresses } : baseQuery("/mobile/addresses", api, extraOptions) as Promise<{ data: Address[] }>,
      providesTags: ["Addresses"],
    }),
    addAddress: builder.mutation<Address, Omit<Address, "_id">>({
      queryFn: async (body, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: { ...body, _id: "address-" + Date.now() } };
        return baseQuery({ url: "/mobile/addresses", method: "POST", body }, api, extraOptions) as Promise<{ data: Address }>;
      },
      invalidatesTags: ["Addresses"],
    }),
    updateAddress: builder.mutation<Address, { id: string; body: Partial<Address> }>({
      queryFn: async ({ id, body }, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          const address = mockAddresses.find((item) => item._id === id);
          return address ? { data: { ...address, ...body } } : { error: { status: 404, data: "Address not found" } };
        }
        return baseQuery({ url: "/mobile/addresses/" + id, method: "PATCH", body }, api, extraOptions) as Promise<{ data: Address }>;
      },
      invalidatesTags: ["Addresses"],
    }),
    deleteAddress: builder.mutation<void, string>({
      queryFn: async (id, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: undefined };
        return baseQuery({ url: "/mobile/addresses/" + id, method: "DELETE" }, api, extraOptions) as Promise<{ data: undefined }>;
      },
      invalidatesTags: ["Addresses"],
    }),
    getWishlist: builder.query<Product[], void>({
      queryFn: async (_arg, api, extraOptions) => USE_MOCK_DATA ? { data: wishlist } : baseQuery("/mobile/wishlist", api, extraOptions) as Promise<{ data: Product[] }>,
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation<Product[], string>({
      queryFn: async (productId, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          const product = mockProducts.find((item) => item._id === productId);
          if (product && !wishlist.some((item) => item._id === productId)) wishlist = wishlist.concat(product);
          return { data: wishlist };
        }
        return baseQuery({ url: "/mobile/wishlist/" + productId, method: "POST" }, api, extraOptions) as Promise<{ data: Product[] }>;
      },
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation<void, string>({
      queryFn: async (productId, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          wishlist = wishlist.filter((item) => item._id !== productId);
          return { data: undefined };
        }
        return baseQuery({ url: "/mobile/wishlist/" + productId, method: "DELETE" }, api, extraOptions) as Promise<{ data: undefined }>;
      },
      invalidatesTags: ["Wishlist"],
    }),
    getPreferences: builder.query<AiPreferences, void>({
      queryFn: async (_arg, api, extraOptions) => USE_MOCK_DATA ? { data: mockPreferences } : baseQuery("/mobile/preferences", api, extraOptions) as Promise<{ data: AiPreferences }>,
      providesTags: ["Preferences"],
    }),
    updatePreferences: builder.mutation<AiPreferences, Partial<AiPreferences>>({
      queryFn: async (body, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: { ...mockPreferences, ...body } };
        return baseQuery({ url: "/mobile/preferences", method: "PATCH", body }, api, extraOptions) as Promise<{ data: AiPreferences }>;
      },
      invalidatesTags: ["Preferences"],
    }),
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      queryFn: async (_arg, api, extraOptions) => USE_MOCK_DATA ? { data: mockPaymentMethods } : baseQuery("/mobile/payment-methods", api, extraOptions) as Promise<{ data: PaymentMethod[] }>,
      providesTags: ["PaymentMethods"],
    }),
    addPaymentMethod: builder.mutation<PaymentMethod, Omit<PaymentMethod, "_id">>({
      queryFn: async (body, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: { ...body, _id: "payment-method-" + Date.now() } };
        return baseQuery({ url: "/mobile/payment-methods", method: "POST", body }, api, extraOptions) as Promise<{ data: PaymentMethod }>;
      },
      invalidatesTags: ["PaymentMethods"],
    }),
    deletePaymentMethod: builder.mutation<void, string>({
      queryFn: async (id, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: undefined };
        return baseQuery({ url: "/mobile/payment-methods/" + id, method: "DELETE" }, api, extraOptions) as Promise<{ data: undefined }>;
      },
      invalidatesTags: ["PaymentMethods"],
    }),
  }),
});

export const {
  useAddAddressMutation,
  useAddPaymentMethodMutation,
  useAddToWishlistMutation,
  useDeleteAddressMutation,
  useDeletePaymentMethodMutation,
  useGetAddressesQuery,
  useGetPaymentMethodsQuery,
  useGetPreferencesQuery,
  useGetProfileQuery,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useUpdateAddressMutation,
  useUpdateMobileProfileMutation,
  useUpdatePreferencesMutation,
} = customerApi;
