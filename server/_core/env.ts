export const ENV = {
  dashboardPassword: process.env.DASHBOARD_PASSWORD ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  rankpilotDatabaseUrl: process.env.RANKPILOT_DATABASE_URL ?? "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "us-east-2",
  s3BucketName: process.env.S3_BUCKET_NAME ?? "",
  cmsBaseUrl: process.env.CMS_BASE_URL ?? "https://sandbox-qa.medicarefaq.com",
  isProduction: process.env.NODE_ENV === "production",
};
