import { createSimpleUpload } from '.';

import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

/* ---------------------------------- */
/* Mocks                              */
/* ---------------------------------- */

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');

  return {
    ...actual,
    S3Client: jest.fn(() => ({
      send: jest.fn(),
    })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: jest.fn(),
}));

/* ---------------------------------- */
/* Tests                              */
/* ---------------------------------- */

describe('createSimpleUpload', () => {
  const config = {
    bucket: 'test-bucket',
    region: 'us-east-1',
    endpoint: 'enpoint',
    credentials: { accessKeyId: '', secretAccessKey: '' },
    maxFileSize: 1000,
    allowedTypes: ['image/png'],
    expiresInSeconds: 123,
  };

  const setup = () => {
    const upload = createSimpleUpload(config);
    const s3Instance = (S3Client as jest.Mock).mock.results.at(0)?.value ?? '';

    return { upload, s3Instance };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ---------- presignPut ---------- */
  it('presignPut returns signed URL', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('signed-put-url');

    const { upload } = setup();

    const url = await upload.presignPut({
      key: 'file.png',
      type: 'image/png',
      size: 500,
    });

    expect(url).toBe('signed-put-url');
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('presignPut rejects invalid file size', async () => {
    const { upload } = setup();

    await expect(
      upload.presignPut({
        key: 'file.png',
        type: 'image/png',
        size: 2000,
      })
    ).rejects.toThrow('File too large');
  });

  it('presignPut rejects invalid file type', async () => {
    const { upload } = setup();

    await expect(
      upload.presignPut({
        key: 'file.txt',
        type: 'text/plain',
        size: 100,
      })
    ).rejects.toThrow('Invalid file type');
  });

  /* ---------- presignPost ---------- */
  it('presignPost returns presigned POST data', async () => {
    (createPresignedPost as jest.Mock).mockResolvedValue({
      url: 'https://s3.amazonaws.com',
      fields: { key: 'value' },
    });

    const { upload } = setup();

    const result = await upload.presignPost({
      key: 'file.png',
      type: 'image/png',
      size: 500,
    });

    expect(result.url).toBeDefined();
    expect(createPresignedPost).toHaveBeenCalledTimes(1);
  });

  /* ---------- createMultipart ---------- */
  it('createMultipart returns uploadId', async () => {
    const { upload, s3Instance } = setup();

    s3Instance.send.mockResolvedValue({
      UploadId: 'upload-id-123',
    });

    const uploadId = await upload.createMultipart({
      key: 'big-file.bin',
      type: 'application/octet-stream',
    });

    expect(uploadId).toBe('upload-id-123');
    expect(s3Instance.send).toHaveBeenCalledWith(
      expect.any(CreateMultipartUploadCommand)
    );
  });

  it('createMultipart throws if UploadId is missing', async () => {
    const { upload, s3Instance } = setup();

    s3Instance.send.mockResolvedValue({});

    await expect(
      upload.createMultipart({
        key: 'big-file.bin',
        type: 'application/octet-stream',
      })
    ).rejects.toThrow('Failed to create multipart upload');
  });

  /* ---------- presignPart ---------- */
  it('presignPart returns signed URL', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('signed-part-url');

    const { upload } = setup();

    const url = await upload.presignPart({
      key: 'file.bin',
      uploadId: 'upload-id',
      partNumber: 1,
    });

    expect(url).toBe('signed-part-url');
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
  });

  /* ---------- completeMultipart ---------- */
  it('completeMultipart sends CompleteMultipartUploadCommand', async () => {
    const { upload, s3Instance } = setup();

    s3Instance.send.mockResolvedValue({});

    await upload.completeMultipart({
      key: 'file.bin',
      uploadId: 'upload-id',
      parts: [{ ETag: 'etag', PartNumber: 1 }],
    });

    expect(s3Instance.send).toHaveBeenCalledWith(
      expect.any(CompleteMultipartUploadCommand)
    );
  });
});
