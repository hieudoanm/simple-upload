import { createSimpleUpload } from '@simple-upload/server';
import { z } from 'zod';
import { procedure, router } from '../trpc';

/**
 * Server-side upload config
 */
const upload = createSimpleUpload({
  bucket: process.env.AWS_S3_BUCKET!,
  region: process.env.AWS_S3_REGION!,
  endpoint: process.env.AWS_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY_ID!,
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/png', 'image/jpeg'],
});

export const appRouter = router({
  /**
   * Presign PUT upload
   */
  presignPost: procedure
    .input(
      z.object({
        filename: z.string().min(1),
        type: z.string().min(1),
        size: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const { url, fields } = await upload.presignPost({
        key: input.filename,
        type: input.type,
        size: input.size,
      });

      return {
        url,
        fields,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
