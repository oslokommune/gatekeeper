const { URL } = require('url')

const log = require('./logging')

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
		log.debug(`Nanoid '${uuid}' failed validation`)
		const error = new ValidationError('Illegal Nanoid')

		error.attempted_nanoid = uuid

		throw error
	}
}

/*
 * Oauth Code Challenge code
 * ref: https://tools.ietf.org/html/rfc7636#section-4.1
 */
const RE_CODE_VALIDATOR = /^(?:[a-zA-Z0-9-_.~])+$/
function verifyLegalCode(code) {
	if (!RE_CODE_VALIDATOR.test(code)) {
		log.debug(`Authorization code flow challenge code '${code}' failed validation`)
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
		log.debug(`Redirect URL '${raw_url}' failed validation due to origin`)
		const error = new ValidationError('Illegal redirect origin')

		error.target_origin = url.origin
		error.legal_origin = rules.ORIGIN

		throw error
	}

	if (!rules.PATHNAME_VALIDATOR.test(url.pathname)) {
		log.debug(`Redirect URL '${raw_url}' failed validation due to path`)
		const error = new ValidationError('Illegal redirect pathname')

		error.target_pathname = url.pathname
		error.legal_pathname_regex = rules.PATHNAME_VALIDATOR

		throw error
	}
	if (url.search !== '') {
		log.debug(`Redirect URL '${raw_url}' failed validation due to query params`)
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
 * Basic UUID character set + punctuation for jwt tokens
 */
const RE_JWT_VALIDATOR = /^(?:[a-zA-Z0-9._-]+)$/
function verifyLegalToken(token) {
	if (!token) {
		log.debug(`Missing token`)
		throw new ValidationError('Cannot validate missing token')
	}

	if (!RE_JWT_VALIDATOR.test(token)) {
		log.debug(`Invalid token '${token}'`)
		throw new ValidationError('Illegal token syntax')
	}
}

module.exports = {
	verifyLegalCode,
	verifyLegalToken,
	verifyLegalLoginUrl,
	verifyLegalLogoutUrl,
	verifyLegalRedirectURL,
	verifyLegalNanoid,
	ValidationError
}
