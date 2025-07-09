import { z } from 'zod';

export const userSchema = z.object({
  name: z.string()
    .min(2, '姓名至少需要2個字符')
    .max(10, '姓名不能超過10個字符'),
  email: z.string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '請輸入有效的電子郵件地址'),
  isActive: z.boolean(),
  description: z.string()
    .min(5, '描述至少需要5個字符')
    .max(200, '描述不能超過200個字符')
});

export type UserFormData = z.infer<typeof userSchema>;
