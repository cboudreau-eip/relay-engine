import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

function getS3Client() {
  return new S3Client({
    region: ENV.awsRegion,
    credentials: {
      accessKeyId: ENV.awsAccessKeyId,
      secretAccessKey: ENV.awsSecretAccessKey,
    },
  });
}

export function isS3Configured(): boolean {
  return Boolean(ENV.awsAccessKeyId && ENV.awsSecretAccessKey && ENV.s3BucketName);
}

export async function pingS3(): Promise<boolean> {
  if (!isS3Configured()) return false;
  try {
    await getS3Client().send(new HeadBucketCommand({ Bucket: ENV.s3BucketName }));
    return true;
  } catch {
    return false;
  }
}
