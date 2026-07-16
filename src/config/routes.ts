export const ROUTES = {
  auth: {
    login: "/login",
  },
  dashboard: {
    home: "/dashboard",
    trips: "/trips",
    drivers: "/drivers",
    vehicles: "/vehicles",
    expenses: "/expenses",
    reports: "/reports",
    settings: "/settings",
  },
} as const;

export type RouteKey = keyof typeof ROUTES.dashboard;
