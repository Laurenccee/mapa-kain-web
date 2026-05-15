import { string, z } from 'zod';

const isBrowser = typeof window !== 'undefined';

export const ProfileSetupSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Bio is required'),
  phone_number: z.string().min(1, 'Phone is required'),
  avatar_url: z
    .union([
      z.string(),
      z.custom<File>(
        (val) => isBrowser && val instanceof File,
        'Invalid file format',
      ),
    ])
    .optional(),
});

export const UploadAvatarSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid User ID format' }),
  uri: z.string().url({ message: 'Invalid image URI' }),
});

export type ProfileSetupData = z.infer<typeof ProfileSetupSchema>;
export type UploadAvatarData = z.infer<typeof UploadAvatarSchema>;
