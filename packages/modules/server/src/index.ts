import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

/* ---------------------------------- */
/* Config (AWS ONLY)                   */
/* ---------------------------------- */

export interface SimpleUploadConfig {
  bucket: string;
  region: string;
  endpoint: string;

  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };

  maxFileSize?: number;
  allowedTypes?: string[];
  expiresInSeconds?: number;
}

export const createSimpleUpload = (config: SimpleUploadConfig) => {
  const s3 = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: config.credentials,
    forcePathStyle: true,
  });

  const validate = (file: { size?: number; type?: string }) => {
    if (config.maxFileSize && file.size && file.size > config.maxFileSize) {
      throw new Error('File too large');
    }

    if (
      config.allowedTypes &&
      file.type &&
      !config.allowedTypes.includes(file.type)
    ) {
      throw new Error('Invalid file type');
    }
  };

  /* ---------- PUT (browser-safe) ---------- */
  const presignPut = async (input: {
    key: string;
    type: string;
    size?: number;
  }): Promise<string> => {
    validate(input);

    const cmd = new PutObjectCommand({
      Bucket: config.bucket,
      Key: input.key,
      ContentType: input.type, // 🔑 REQUIRED
    });

    return getSignedUrl(s3, cmd, {
      expiresIn: config.expiresInSeconds ?? 300,
    });
  };

  /* ---------- POST (recommended for browsers) ---------- */
  const presignPost = async (input: {
    key: string;
    type: string;
    size: number;
  }) => {
    validate(input);

    return createPresignedPost(s3, {
      Bucket: config.bucket,
      Key: input.key,
      Expires: config.expiresInSeconds ?? 300,
      Conditions: [
        ['content-length-range', 0, config.maxFileSize ?? input.size],
        ['eq', '$Content-Type', input.type],
      ],
      Fields: {
        'Content-Type': input.type,
      },
    });
  };

  /* ---------- Multipart ---------- */
  const createMultipart = async (input: {
    key: string;
    type: string;
  }): Promise<string> => {
    const res = await s3.send(
      new CreateMultipartUploadCommand({
        Bucket: config.bucket,
        Key: input.key,
        ContentType: input.type,
      })
    );

    if (!res.UploadId) {
      throw new Error('Failed to create multipart upload');
    }

    return res.UploadId;
  };

  const presignPart = async (input: {
    key: string;
    uploadId: string;
    partNumber: number;
  }): Promise<string> => {
    const cmd = new UploadPartCommand({
      Bucket: config.bucket,
      Key: input.key,
      UploadId: input.uploadId,
      PartNumber: input.partNumber,
    });

    return getSignedUrl(s3, cmd, {
      expiresIn: 3600,
    });
  };

  const completeMultipart = async (input: {
    key: string;
    uploadId: string;
    parts: { ETag: string; PartNumber: number }[];
  }): Promise<void> => {
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: config.bucket,
        Key: input.key,
        UploadId: input.uploadId,
        MultipartUpload: {
          Parts: input.parts,
        },
      })
    );
  };

  return {
    presignPut,
    presignPost,
    createMultipart,
    presignPart,
    completeMultipart,
  };
};
