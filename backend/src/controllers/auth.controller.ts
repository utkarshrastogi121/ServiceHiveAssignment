import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { signupSchema, loginSchema } from '../schemas/validators';
import createError from 'http-errors';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = signupSchema.parse(req.body);
    const existing = await User.findOne({ email: parsed.email });
    if (existing) throw createError(409, 'Email already registered');

    const saltRounds = 10;
    const hash = await bcrypt.hash(parsed.password, saltRounds);
    const user = await User.create({ name: parsed.name, email: parsed.email, passwordHash: hash });
    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res.status(201).json({ user: { id: user._id, email: user.email, name: user.name }, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email });
    if (!user) throw createError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) throw createError(401, 'Invalid credentials');

    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res.json({ user: { id: user._id, email: user.email, name: user.name }, token });
  } catch (err) {
    next(err);
  }
}
