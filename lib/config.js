const { URL } = require('url')

const BASE_URL = 'BASE_URL'
const CERTIFICATE_FILE = 'CERTIFICATE_FILE'
const CLIENT_ID = 'CLIENT_ID'
const CLIENT_SECRET = 'CLIENT_SECRET'
const CORS_ORIGINS = 'CORS_ORIGINS'
const TOKEN_COOKIES_DOMAIN = 'TOKEN_COOKIES_DOMAIN'
const TOKEN_COOKIES_SAMESITE = 'TOKEN_COOKIES_SAMESITE'
const TOKEN_COOKIES_SECURE = 'TOKEN_COOKIES_SECURE'
const TOKEN_COOKIES_PREFIX = 'TOKEN_COOKIES_PREFIX'
const DISCOVERY_URL = 'DISCOVERY_URL'
const ERROR_URL = 'ERROR_URL'
const KEY_FILE = 'KEY_FILE'
const LOG_LEVEL = 'LOG_LEVEL'
const LOG_PRETTY_PRINT = 'LOG_PRETTY_PRINT'
const ORIGIN_WHITELIST = 'ORIGIN_WHITELIST'
const PORT = 'PORT'
const REDIS_URI = 'REDIS_URI'
const REDIS_PASSWORD = 'REDIS_PASSWORD'
const SUCCESSFUL_LOGIN_ORIGINS = 'SUCCESSFUL_LOGIN_ORIGINS'
const SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR = 'SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR'
const SUCCESSFUL_LOGOUT_ORIGINS = 'SUCCESSFUL_LOGOUT_ORIGINS'
const SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR =
	'SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR'
const UPSTREAMS = 'UPSTREAMS'

const config = {
	cookies: {
		domain: getEnv(TOKEN_COOKIES_DOMAIN, new URL(getEnv(BASE_URL)).hostname),
		same_site: getEnv(TOKEN_COOKIES_SAMESITE, 'strict'),
		secure: getEnv(TOKEN_COOKIES_SECURE, '') !== 'false',
		prefix: getEnv(TOKEN_COOKIES_PREFIX, '')
	},

	logging: {
		log_level: getEnv(LOG_LEVEL, 'info'),
		pretty_print: getEnv(LOG_PRETTY_PRINT, '')
	},

	oauth: {
		client_id: getEnv(CLIENT_ID),
		client_secret: getEnv(CLIENT_SECRET)
	},

	redis: {
		uri: getEnv(REDIS_URI, ''),
		password: getEnv(REDIS_PASSWORD, '')
	},

	legal_urls: {
		cors_origins: ensureList(getEnv(CORS_ORIGINS, '')),
		login_redirect_origins: ensureList(getEnv(SUCCESSFUL_LOGIN_ORIGINS, '')),
		login_redirect_path_validator: getEnv(
			SUCCESSFUL_LOGIN_PATHNAME_VALIDATOR,
			/\//
		),
		logout_redirect_origins: ensureList(getEnv(SUCCESSFUL_LOGOUT_ORIGINS, '')),
		logout_redirect_path_validator: getEnv(
			SUCCESSFUL_LOGOUT_PATHNAME_VALIDATOR,
			/\//
		),
		whitelist: ensureList(getEnv(ORIGIN_WHITELIST, ''))
	},

	base_url: getEnv(BASE_URL),
	discovery_url: getEnv(DISCOVERY_URL),
	error_url: getEnv(ERROR_URL, ''),
	listening_port: getEnv(PORT, 4554),
	upstreams: ensureList(getEnv(UPSTREAMS, []))
}

/*
 * Handle SSL
 */
cert = getEnv(CERTIFICATE_FILE, '')
key = getEnv(KEY_FILE, '')

if (cert || key) {
	if (!cert || !key) throw new Error('SSL requires both a certificate and a key')

	config.ssl = {
		certificate_file: cert,
		key_file: key
	}
}

/*
 * Redis
 */
if (!config.redis.uri) delete config.redis

module.exports = config

/*
 * Helpers
 */
function ensureList(obj, deliminator = ';') {
	if (!obj) return []
	if (obj instanceof Array) return obj
	if (obj.indexOf(deliminator) === -1) return [obj]

	const stripped = obj.replace(/\s/g, '').replace(/"/g, '')

	return stripped.split(deliminator).filter((item) => !!item)
}

// If fallback is not specified, the variable is assumed required
function getEnv(key, fallback) {
	const raw = process.env[key] || ''

	const processed = raw.trim()

	if (processed) return processed

	if (fallback !== undefined) return fallback

	throw new Error(`Missing required environment variable ${key}`)
}
