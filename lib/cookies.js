const { URL } = require('url')

const BASE_URL = new URL(process.env.BASE_URL)

const COOKIE_OPTIONS = Object.freeze({
	httpOnly: true,
	domain: BASE_URL.hostname,
	secure: true,
	sameSite: 'strict'
})

module.exports = {
	COOKIE_OPTIONS
}
