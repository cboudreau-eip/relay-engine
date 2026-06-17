import {
  S3Client,
  HeadBucketCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

const PREFIX = "incoming/";

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

/**
 * Count the content ideas currently sitting in the S3 bucket's `incoming/`
 * folder. This mirrors the medicarefaq-next CMS ingest route: each JSON file
 * holds an `articles` array, and the true intake number is the sum of all
 * articles across every JSON file. This is the one server-side, cross-device
 * number for the pipeline (the CMS tool's Review/Queue/Output counts live in
 * browser localStorage and cannot be read from here).
 */
export async function getS3IntakeStats(): Promise<{ files: number; articles: number }> {
  if (!isS3Configured()) return { files: 0, articles: 0 };

  try {
    const s3 = getS3Client();
    const listResp = await s3.send(
      new ListObjectsV2Command({ Bucket: ENV.s3BucketName, Prefix: PREFIX })
    );

    const jsonFiles = (listResp.Contents || []).filter((o) => o.Key?.endsWith(".json"));

    let articleCount = 0;
    for (const file of jsonFiles) {
      const getResp = await s3.send(
        new GetObjectCommand({ Bucket: ENV.s3BucketName, Key: file.Key! })
      );
      const bodyStr = await getResp.Body?.transformToString("utf-8");
      if (!bodyStr) continue;
      try {
        const data = JSON.parse(bodyStr);
        articleCount += Array.isArray(data.articles) ? data.articles.length : 0;
      } catch {
        // skip unparseable files
      }
    }

    return { files: jsonFiles.length, articles: articleCount };
  } catch {
    return { files: 0, articles: 0 };
  }
}
