/**
 * @jest-environment jsdom
 */
import { createRoot } from 'solid-js';
import { createSimpleUpload } from '.';

describe('createSimpleUpload (solid)', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });
  });

  it('tracks uploading state and progress', async () => {
    const file = new File(['data'], 'file.txt', { type: 'text/plain' });

    createRoot(async (dispose) => {
      const upload = createSimpleUpload();

      expect(upload.uploading()).toBe(false);
      expect(upload.progress()).toBe(0);

      await upload.uploadPutFile(file, 'https://signed-url');

      expect(upload.uploading()).toBe(false);
      expect(upload.progress()).toBe(100);

      dispose();
    });
  });
});
