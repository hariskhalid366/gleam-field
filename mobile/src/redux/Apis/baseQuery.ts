import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../helpers/data";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth?: { token?: string } }).auth?.token;
    if (token) headers.set("authorization", "Bearer " + token);
    headers.set("accept", "application/json");
    return headers;
  },
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if ("data" in result && result.data && typeof result.data === "object" && "data" in result.data) {
    return { data: (result.data as { data: unknown }).data };
  }
  return result;
};
