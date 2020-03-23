const { URL } = require('url')

const { log } = require('./logging')
const { ensureList } = require('./tools')

class ValidationError extends Error {
	constructor(message, attempted = 'undefined', legal = 'undefined') {
		super(message)

		this.name = 'ValidationError'
		this.attempted = attempted
		this.legal = legal
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

		throw new ValidationError('Illegal Nanoid', uuid)
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

		throw new ValidationError('Illegal code characters', code)
	}
}

function validateOrigin(origin, legal_origins) {
	if (legal_origins.indexOf(origin) !== -1) return true

	throw new ValidationError('Invalid origin', origin, legal_origins)
}

/*
 * Login / logout redirect whitelist
 */
function verifyLegalRedirectURL(rules, raw_url) {
	const url = new URL(raw_url)

	try {
		validateOrigin(url.origin, rules.origins)
	}
	catch (error) {
		log.debug(`Redirect URL '${raw_url}' failed validation due to origin`, error)

		throw error
	}

	if (!rules.pathname_validator.test(url.pathname)) {
		log.debug(`Redirect URL '${raw_url}' failed validation due to path`)

		throw new ValidationError('Illegal redirect pathname', url.pathname, rules.pathname_validator)
	}
	if (url.search !== '') {
		log.debug(`Redirect URL '${raw_url}' failed validation due to query params`)

		throw new ValidationError('Illegal redirect query params', url.search, 'none')
	}
}

function verifyLegalLoginUrl(raw_url) {
	const rules = {
		origins: process.env.ORIGIN_WHITELIST,
		pathname_validator: /\//
	}

	if (process.env.SUCCESSFUL_LOGIN_ORIGINS)
		rules.origins = ensureList(process.env.SUCCESSFUL_LOGIN_ORIGINS)
	if (process.env.SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR)
		rules.pathname_validator = new RegExp(process.env.SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR)

	return verifyLegalRedirectURL(rules, raw_url)
}
function verifyLegalLogoutUrl(raw_url) {
	const rules = {
		origins: process.env.ORIGIN_WHITELIST,
		pathname_validator: /\//
	}

	if (process.env.SUCCESSFUL_LOGOUT_ORIGINS)
		rules.origins = ensureList(process.env.SUCCESSFUL_LOGOUT_ORIGIN)
	if (process.env.SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR)
		rules.pathname_validator = process.env.SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR

	return verifyLegalRedirectURL(rules, raw_url)
}

/*
 * Basic UUID character set + punctuation for jwt tokens
 */
const RE_JWT_VALIDATOR = /^(?:[a-zA-Z0-9._-]+)$/
function verifyLegalToken(token) {
	if (!token) {
		log.debug(`Missing token`)
		throw new ValidationError('Cannot validate missing token', 'undefined')
	}

	if (!RE_JWT_VALIDATOR.test(token)) {
		log.debug('Invalid token')
		throw new ValidationError('Illegal token syntax', token)
	}
}

module.exports = {
	verifyLegalCode,
	verifyLegalToken,
	verifyLegalLoginUrl,
	verifyLegalLogoutUrl,
	verifyLegalRedirectURL,
	verifyLegalNanoid,
	validateOrigin,
	ValidationError
}
