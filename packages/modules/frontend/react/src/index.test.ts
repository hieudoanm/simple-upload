// upload.test.ts
import { act, renderHook } from '@testing-library/react';
import { uploadMultipart, uploadPost, uploadPut, useSimpleUpload } from '.';

describe('upload utilities', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn();
  });

  /* ---------- uploadPut ---------- */

  describe('uploadPut', () => {
    it('uploads file via PUT and reports progress', async () => {
      const file = new File(['hello'], 'test.txt', {
        type: 'text/plain',
      });
      const onProgress = jest.fn();

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await uploadPut(file, 'https://signed-url', onProgress);

      expect(fetch).toHaveBeenCalledWith(
        'https://signed-url',
        expect.objectContaining({
          method: 'PUT',
          body: file,
        })
      );

      expect(onProgress).toHaveBeenCalledWith(0);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('throws when PUT upload fails', async () => {
      const file = new File(['x'], 'x.txt');

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(uploadPut(file, 'https://signed-url')).rejects.toThrow(
        'PUT upload failed'
      );
    });
  });

  /* ---------- uploadPost ---------- */

  describe('uploadPost', () => {
    it('uploads file via POST form', async () => {
      const file = new File(['data'], 'file.txt');

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await uploadPost(file, {
        url: 'https://s3-post-url',
        fields: {
          key: 'file.txt',
          policy: 'policy',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://s3-post-url',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('throws when POST upload fails', async () => {
      const file = new File(['data'], 'file.txt');

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(
        uploadPost(file, {
          url: 'https://s3-post-url',
          fields: {},
        })
      ).rejects.toThrow('POST upload failed');
    });
  });

  /* ---------- uploadMultipart ---------- */

  describe('uploadMultipart', () => {
    it('uploads multipart file and completes upload', async () => {
      const file = new File([new Uint8Array(10 * 1024 * 1024)], 'big.bin');

      const api = {
        create: jest.fn().mockResolvedValue('upload-id'),
        signPart: jest.fn().mockResolvedValue('https://signed-part'),
        complete: jest.fn().mockResolvedValue(undefined),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => '"etag-value"',
        },
      });

      await uploadMultipart(file, api, 5 * 1024 * 1024);

      expect(api.create).toHaveBeenCalled();
      expect(api.signPart).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledTimes(2);

      expect(api.complete).toHaveBeenCalledWith([
        { ETag: 'etag-value', PartNumber: 1 },
        { ETag: 'etag-value', PartNumber: 2 },
      ]);
    });

    it('fails if a part upload fails', async () => {
      const file = new File([new Uint8Array(5)], 'fail.bin');

      const api = {
        create: jest.fn().mockResolvedValue('upload-id'),
        signPart: jest.fn().mockResolvedValue('https://signed-part'),
        complete: jest.fn(),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(uploadMultipart(file, api, 1)).rejects.toThrow(
        'Multipart upload failed at part 1'
      );
    });
  });

  /* ---------- useSimpleUpload hook ---------- */

  describe('useSimpleUpload', () => {
    it('tracks uploading state and progress', async () => {
      const file = new File(['data'], 'file.txt');

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const { result } = renderHook(() => useSimpleUpload());

      expect(result.current.uploading).toBe(false);

      await act(async () => {
        await result.current.uploadPutFile(file, 'https://signed-url');
      });

      expect(result.current.uploading).toBe(false);
      expect(result.current.progress).toBe(100);
    });
  });
});
