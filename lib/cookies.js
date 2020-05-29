const { URL } = require('url')

const BASE_URL = new URL(process.env.BASE_URL)

const COOKIE_OPTIONS = Object.freeze({
	domain: process.env.TOKEN_COOKIES_DOMAIN
		? process.env.TOKEN_COOKIES_DOMAIN
		: BASE_URL.hostname,
	sameSite: process.env.TOKEN_COOKIES_SAMESITE
		? process.env.TOKEN_COOKIES_SAMESITE
		: 'strict',
	secure: process.env.TOKEN_COOKIES_SECURE !== 'false',
	httpOnly: true,
	path: '/'
})

const COOKIE_PREFIX = process.env.TOKEN_COOKIES_PREFIX || ''
const COOKIE_STATE_ID = `${COOKIE_PREFIX}state_id`
const COOKIE_ACCESS_TOKEN = `${COOKIE_PREFIX}access_token`
const COOKIE_REFRESH_TOKEN = `${COOKIE_PREFIX}refresh_token`

function set(res, key, value, options = {}) {
	const composite_options = Object.assign({}, COOKIE_OPTIONS, options)

	res.cookie(key, value, composite_options)
}
function get(req, key, default_value = null) {
	if (!(key in req.cookies)) return default_value

	return req.cookies[key]
}
function clear(res, key, options = {}) {
	const composite_options = Object.assign({}, COOKIE_OPTIONS, options)

	res.clearCookie(key, composite_options)
}

module.exports = {
	setStateId: (res, id) =>
		set(res, COOKIE_STATE_ID, id, { path: '/callback', sameSite: 'lax' }),
	getStateId: (req) => get(req, COOKIE_STATE_ID),
	clearStateId: (res) => clear(res, COOKIE_STATE_ID, { path: '/callback' }),

	setAccessToken: (res, token, expires_in) => {
		let expiry = new Date(Date.now())
		expiry.setSeconds(expiry.getSeconds() + expires_in)

		set(res, COOKIE_ACCESS_TOKEN, token, { expires: expiry })
	},
	getAccessToken: (req) => get(req, COOKIE_ACCESS_TOKEN),
	clearAccessToken: (res) => clear(res, COOKIE_ACCESS_TOKEN),

	setRefreshToken: (res, token) => set(res, COOKIE_REFRESH_TOKEN, token),
	getRefreshToken: (req) => get(req, COOKIE_REFRESH_TOKEN),
	clearRefreshToken: (res) => clear(res, COOKIE_REFRESH_TOKEN)
}
