import { createApi } from "@reduxjs/toolkit/query/react";
import { mockBanners, mockCategories, mockProducts } from "../../../mocks/user.mock";
import type { Banner, Category, Product } from "../../../helpers/types";
import { baseQuery } from "../baseQuery";
import { USE_MOCK_DATA } from "../../../helpers/data";

type ProductParams = { q?: string; category?: string };

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery,
  tagTypes: ["Products", "Categories"],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      queryFn: async (_arg, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: mockCategories };
        return baseQuery({ url: "/storefront/categories" }, api, extraOptions) as Promise<{
          data: Category[];
        }>;
      },
      providesTags: ["Categories"],
    }),
    getProducts: builder.query<Product[], ProductParams | void>({
      queryFn: async (params, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          const products = mockProducts.filter(
            (product) =>
              (!params?.category || product.category === params.category) &&
              (!params?.q || product.name.toLowerCase().includes(params.q.toLowerCase())),
          );
          return { data: products };
        }
        return baseQuery(
          { url: "/storefront/products", params: params || undefined },
          api,
          extraOptions,
        ) as Promise<{ data: Product[] }>;
      },
      providesTags: ["Products"],
    }),
    getProduct: builder.query<Product & { stock: number }, string>({
      queryFn: async (slug, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          const product = mockProducts.find((item) => item.slug === slug);
          return product
            ? { data: { ...product, stock: 24 } }
            : { error: { status: 404, data: "Product not found" } };
        }
        return baseQuery({ url: "/storefront/products/" + slug }, api, extraOptions) as Promise<{
          data: Product & { stock: number };
        }>;
      },
    }),
    getBanners: builder.query<Banner[], void>({
      queryFn: async (_arg, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: mockBanners };
        return baseQuery({ url: "/storefront/banners" }, api, extraOptions) as Promise<{
          data: Banner[];
        }>;
      },
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetCategoriesQuery,
  useGetProductQuery,
  useGetProductsQuery,
} = catalogApi;
