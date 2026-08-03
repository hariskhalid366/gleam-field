import { createApi } from "@reduxjs/toolkit/query/react";
import type { UserNotification } from "../../../helpers/types";
import { USE_MOCK_DATA } from "../../../helpers/data";
import { baseQuery } from "../baseQuery";

let notifications: UserNotification[] = [
  { _id: "delivery", title: "Order on its way", body: "Your FR-4821 order arrives in 28 minutes.", category: "orders", channel: "inapp" },
  { _id: "picks", title: "Fresh weekly picks", body: "Your personalised produce list is ready.", category: "growth", channel: "inapp" },
];

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<{ data: UserNotification[]; unread: number }, void>({
      queryFn: async (_arg, api, extraOptions) => {
        if (USE_MOCK_DATA) return { data: { data: notifications, unread: notifications.filter((item) => !item.readAt).length } };
        return baseQuery("/notifications/mine", api, extraOptions) as Promise<{ data: { data: UserNotification[]; unread: number } }>;
      },
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<UserNotification, string>({
      queryFn: async (id, api, extraOptions) => {
        if (USE_MOCK_DATA) {
          notifications = notifications.map((item) => item._id === id ? { ...item, readAt: new Date().toISOString() } : item);
          return { data: notifications.find((item) => item._id === id)! };
        }
        return baseQuery({ url: "/notifications/mine/" + id + "/read", method: "PATCH" }, api, extraOptions) as Promise<{ data: UserNotification }>;
      },
      invalidatesTags: ["Notifications"],
    }),
    registerDeviceToken: builder.mutation<{ ok: boolean }, { token: string; platform: "ios" | "android" | "web" }>({
      query: (body) => ({ url: "/notifications/device-token", method: "POST", body }),
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation, useRegisterDeviceTokenMutation } = notificationApi;
