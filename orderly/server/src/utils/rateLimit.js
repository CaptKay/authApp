import rateLimit from 'express-rate-limit'


export const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {errorMessage: 'Too many login attempts. Try again later.'}
})

export const forgotLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {errorMessage: 'Too many login attempts. Try again later.'}
})

export const verifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {errorMessage: 'Too many login attempts. Try again later.'}
})

export const refreshLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {errorMessage: 'Too many login attempts. Try again later.'}
})