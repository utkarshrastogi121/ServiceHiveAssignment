import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createEventSchema = z.object({
  title: z.string().min(1),
  startTime: z.string().refine(s => !Number.isNaN(Date.parse(s)), { message: "startTime must be an ISO date string" }),
  endTime: z.string().refine(s => !Number.isNaN(Date.parse(s)), { message: "endTime must be an ISO date string" }),
  status: z.enum(['BUSY','SWAPPABLE','SWAP_PENDING']).optional()
});

export const swapRequestSchema = z.object({
  mySlotId: z.string().min(1),
  theirSlotId: z.string().min(1)
});

export const swapResponseSchema = z.object({
  accept: z.boolean()
});
