import crypto from 'crypto'
import bcrypt from 'bcrypt'

//REMOVE DASHES
export function canonicalizeCode(input){
    return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

//GENERATE RAW CODES
export function generateBackupCodes(n=8){
    const codes = []
    for(let i = 0; i < n; i++){
        const raw = crypto.randomBytes(5).toString('base64url').replace(/[^A-Za-z0-9]/g,'').slice(0,8).toUpperCase()
        codes.push(raw.slice(0,4)  +  '-'  + raw.slice(4))
    }
    return codes;
}

//HASH THE RAW CODES
export async function hashBackupCodes(displayCodes) {
    const out = []
    for(const display of displayCodes){
        const canon = canonicalizeCode(display)
        out.push(await bcrypt.hash(canon, 10))
    }
    return out
}

//VERIFY RAW AND HASHED CODES
export async function matchAndRemoveBackupCode(rawInputCode, hashes) {
    const canon = canonicalizeCode(rawInputCode)
    for(let i = 0; i < (hashes || []).length; i++){
        if(await bcrypt.compare(canon, hashes[i])){
            return i
        }
    }
    return -1
}

