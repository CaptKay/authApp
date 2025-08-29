import 'dotenv/config'

const isProd = process.env.NODE_ENV === 'production'

/**
 * Attach the refresh token cookie to the response.
 * @param {object} res - Express response
 * @param {string} token - JWT refresh token
 */

export function setRefreshCookie(res, token){
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: isProd,
        samesite: isProd ? 'strict' : 'lax',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

export function clearRefreshCookie(res){
    res.clearCookie('refreshToken', {path: '/api/auth/refresh'})
}