import bcrypt from 'bcrypt'


export const hashPassword = (plain) => bcrypt.hash(plain, 12)
export const verifyPassword = (plain, hash)=> bcrypt.compare(plain, hash)