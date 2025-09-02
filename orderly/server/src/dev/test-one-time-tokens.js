import {hashToken, makeRawToken, verifyHashedToken} from '../utils/oneTimeTokens.js'


const hexedRaw = makeRawToken(32)
const hashedRawToken = await hashToken(hexedRaw)
console.log('raw (len, type): ', hexedRaw?.length, typeof hexedRaw)
console.log('hashedRawToken (startsWith $2, type):', hashedRawToken?.startsWith?.('$2'), typeof hashedRawToken);


const ok = await verifyHashedToken(hexedRaw, hashedRawToken)
const bad = await verifyHashedToken("not-the-token", hashedRawToken)

console.log({rawlen: hexedRaw.length, ok, bad})
