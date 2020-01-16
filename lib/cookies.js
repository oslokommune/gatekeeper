const { URL } = require('url')

const BASE_URL = new URL(process.env.BASE_URL)

const COOKIE_OPTIONS = Object.freeze({
	httpOnly: true,
	domain: BASE_URL.hostname,
	secure: true,
	sameSite: 'strict'
})

const COOKIE_STATE_ID = 'state_id'
const COOKIE_ACCESS_TOKEN = 'access_token'
const COOKIE_REFRESH_TOKEN = 'refresh_token'

function set(res, path, key, value) {
	const options = Object.assign({ path }, COOKIE_OPTIONS)

	res.cookie(key, value, options)
}
function get(req, key, default_value=null) {
	if (!(key in req.cookies))
		return default_value

	return req.cookies[key]
}
function clear(res, key) {
	res.clearCookie(key)
}

module.exports = {
	setStateId: (res, id) => set(res, '/callback', COOKIE_STATE_ID, id),
	getStateId: (req) => get(req, COOKIE_STATE_ID),
	clearStateId: (res) => clear(res, COOKIE_STATE_ID),

	setAccessToken: (res, token) => set(res, '/', COOKIE_ACCESS_TOKEN, token),
	getAccessToken: (req) => get(req, COOKIE_ACCESS_TOKEN),
	clearAccessToken: (res) => clear(res, COOKIE_ACCESS_TOKEN),

	setRefreshToken: (res, token) => set(res, '/', COOKIE_REFRESH_TOKEN, token),
	getRefreshToken: (req) => get(req, COOKIE_REFRESH_TOKEN),
	clearRefreshToken: (res) => clear(res, COOKIE_REFRESH_TOKEN)
}
