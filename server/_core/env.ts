export const ENV = {
  dashboardPassword: process.env.DASHBOARD_PASSWORD ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  rankpilotDatabaseUrl: process.env.RANKPILOT_DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
