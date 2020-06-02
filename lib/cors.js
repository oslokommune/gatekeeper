const cors = require('cors')

const { log } = require('./logging')
const { ensureList } = require('./tools')
const { validateOrigin } = require('./validators')

function corsPluginOriginValidator(origin, callback) {
	// Origin often undefined during machine-to-machine communications (which is what is happening nuxt server side)
	if (!origin) return callback(null, true)

	let cors_whitelist = ensureList(process.env.ORIGIN_WHITELIST)
	if (process.env.CORS_ORIGINS)
		cors_whitelist = ensureList(process.env.CORS_ORIGINS)

	try {
		validateOrigin(origin, cors_whitelist)

		callback(null, true)
	} catch (error) {
		log.error('CORS: ', error)
		callback(error)
	}
}

const corsOptions = {
	credentials: true,
	origin: corsPluginOriginValidator
}

module.exports = {
	middleware: cors(corsOptions)
}
