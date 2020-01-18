const { URL } = require('url')

class ValidationError extends Error {
	constructor(message) {
		super(message)

		this.name = 'ValidationError'
	}
}

/*
 * Nanoid / UUID
 * Used for state and state ID
 */
const RE_NANOID_VALIDATOR = /^[a-zA-Z0-9_-]{21}$/
function verifyLegalNanoid(uuid) {
	if (!RE_NANOID_VALIDATOR.test(uuid)) {
		const error = new ValidationError('Illegal Nanoid')

		error.attempted_nanoid = uuid

		throw error
	}
}

/*
 * Oauth Code Challenge code
 * Good enough for our Keycloak, but might be expanded with _ and ~
 * ref: https://tools.ietf.org/html/rfc7636#section-4.1
 */
const RE_CODE_VALIDATOR = /^(?:[a-z0-9-.]){110}$/
function verifyLegalCode(code) {
	if (!RE_CODE_VALIDATOR.test(code)) {
		const error = new ValidationError('Illegal code characters')

		error.attempted_code = code

		throw error
	}
}

/*
 * Login / logout redirect whitelist
 */
function verifyLegalRedirectURL(rules, raw_url) {
	const url = new URL(raw_url)

	if (url.origin !== rules.ORIGIN) {
		const error = new ValidationError('Illegal redirect origin')

		error.target_origin = url.origin
		error.legal_origin = rules.ORIGIN

		throw error
	}

	if (!rules.PATHNAME_VALIDATOR.test(url.pathname)) {
		const error = new ValidationError('Illegal redirect pathname')

		error.target_pathname = url.pathname
		error.legal_pathname_regex = rules.PATHNAME_VALIDATOR

		throw error
	}
	if (url.search !== '') {
		const error = new ValidationError('Illegal redirect query params')

		error.target_query_params = url.search
		error.legal_query_params = 'none'

		throw error
	}
}

const LOGIN_RULES = {
	ORIGIN: process.env.SUCCESSFUL_LOGIN_ORIGIN,
	PATHNAME_VALIDATOR: /\//
}
const LOGOUT_RULES = {
	ORIGIN: process.env.SUCCESSFUL_LOGOUT_ORIGIN,
	PATHNAME_VALIDATOR: /\//
}
if (process.env.SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR)
	LOGIN_RULES.PATHNAME_VALIDATOR = new RegExp(process.env.SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR)
if (process.env.SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR)
	LOGOUT_RULES.PATHNAME_VALIDATOR = new RegExp(process.env.SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR)

function verifyLegalLoginUrl(raw_url) {
	return verifyLegalRedirectURL(LOGIN_RULES, raw_url)
}
function verifyLegalLogoutUrl(raw_url) {
	return verifyLegalRedirectURL(LOGOUT_RULES, raw_url)
}

/*
 * JWT syntax validation
 * Backend service must do the actual validation
 */
const RE_JWT_VALIDATOR = /^(?:[a-zA-Z0-9_-]+)$/
function verifyLegalJWTToken(token) {
	if (!token || token.indexOf('.') === -1)
		throw new ValidationError('Illegal token syntax')

	const parts = token.split('.')

	if (parts.length !== 3)
		throw new ValidationError('Illegal token syntax')

	parts.forEach(part => {
		if (!RE_JWT_VALIDATOR.test(part))
			throw new ValidationError('Illegal token syntax')
	})
}

module.exports = {
	verifyLegalCode,
	verifyLegalJWTToken,
	verifyLegalLoginUrl,
	verifyLegalLogoutUrl,
	verifyLegalRedirectURL,
	verifyLegalNanoid,
	ValidationError
}
