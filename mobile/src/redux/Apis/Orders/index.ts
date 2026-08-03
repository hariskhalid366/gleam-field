import { createApi } from "@reduxjs/toolkit/query/react";
import { findMockProduct, mockOrders } from "../../../mocks/user.mock";
import type { Order } from "../../../helpers/types";
import { baseQuery } from "../baseQuery";
import { USE_MOCK_DATA } from "../../../helpers/data";

type CheckoutPayload = { items: { product: string; qty: number }[]; address: string };

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getMyOrders: builder.query<Order[], void>({
      queryFn: async (_arg, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: mockOrders };
        return baseQuery({ url: "/orders/mine" }, api, extraOptions) as Promise<{ data: Order[] }>;
      },
      providesTags: ["Orders"],
    }),
    checkout: builder.mutation<Order, CheckoutPayload>({
      queryFn: async (body, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          return {
            data: {
              ...mockOrders[0],
              _id: "mock-order-" + Date.now(),
              reference: "FR-" + Math.floor(1000 + Math.random() * 8999),
              total: body.items.reduce(
                (sum, item) => sum + findMockProduct(item.product).price * item.qty,
                0,
              ),
              items: body.items.map((item) => ({
                name: findMockProduct(item.product).name,
                qty: item.qty,
                price: findMockProduct(item.product).price,
              })),
            },
          };
        }
        return baseQuery(
          { url: "/orders/checkout", method: "POST", body },
          api,
          extraOptions,
        ) as Promise<{ data: Order }>;
      },
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useCheckoutMutation, useGetMyOrdersQuery } = orderApi;
