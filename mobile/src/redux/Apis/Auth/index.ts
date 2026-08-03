import { createApi } from "@reduxjs/toolkit/query/react";
import type { User } from "../../../helpers/types";
import { baseQuery } from "../baseQuery";

type Credentials = { email: string; password: string };
type Registration = Credentials & { name: string };
type AuthResponse = { token: string; user: User };
type ApiLoginResponse = { accessToken: string; user: User };
type TechnicianProfile = { verificationStatus: "none" | "submitted" | "pending" | "approved" | "rejected" | "suspended" | "blocked" };

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, Credentials>({
      queryFn: async (body, api, extraOptions) => {
        const response = await baseQuery(
          { url: "/auth/login", method: "POST", body },
          api,
          extraOptions,
        );
        if ("error" in response) return { error: response.error! };
        const data = response.data as ApiLoginResponse;
        return { data: { token: data.accessToken, user: data.user } };
      },
    }),
    register: builder.mutation<AuthResponse, Registration>({
      queryFn: async (body, api, extraOptions) => {
        const response = await baseQuery(
          { url: "/auth/register", method: "POST", body },
          api,
          extraOptions,
        );
        if ("error" in response) return { error: response.error! };
        const data = response.data as ApiLoginResponse;
        return { data: { token: data.accessToken, user: data.user } };
      },
    }),
    getMe: builder.query<User, void>({
      queryFn: async (_body, api, extraOptions) => {
        const response = await baseQuery({ url: "/auth/me" }, api, extraOptions);
        if ("error" in response) return { error: response.error! };
        const data = response.data as { user?: User };
        return data.user ? { data: data.user } : { error: { status: "CUSTOM_ERROR", error: "Invalid session response" } };
      },
    }),
    updateProfile: builder.mutation<User, Partial<Pick<User, "name">> & { avatarUrl?: string }>({
      queryFn: async (body, api, extraOptions) => {
        const response = await baseQuery({ url: "/auth/me", method: "PATCH", body }, api, extraOptions);
        if ("error" in response) return { error: response.error! };
        const data = response.data as { user?: User };
        return data.user ? { data: data.user } : { error: { status: "CUSTOM_ERROR", error: "Invalid profile response" } };
      },
    }),
    changePassword: builder.mutation<{ ok: boolean }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
    logout: builder.mutation<void, void>({
      queryFn: async (_body, api, extraOptions) => {
        return baseQuery({ url: "/auth/logout", method: "POST" }, api, extraOptions) as Promise<{
          data: undefined;
        }>;
      },
    }),
    technicianMe: builder.query<TechnicianProfile, void>({ query: () => "/technicians/me" }),
  }),
});

export const { useChangePasswordMutation, useGetMeQuery, useLazyGetMeQuery, useLoginMutation, useLogoutMutation, useRegisterMutation, useUpdateProfileMutation, useTechnicianMeQuery } = authApi;
