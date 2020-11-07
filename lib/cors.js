const cors = require('cors')

const config = require('./config')
const { log } = require('./logging')
const { validateOrigin } = require('./validators')

function corsPluginOriginValidator(origin, callback) {
	// Origin often undefined during machine-to-machine communications (which is what is happening nuxt server side)
	if (!origin) return callback(null, true)

	let cors_whitelist = config.legal_urls.whitelist
	if (config.legal_urls.cors_origins.length > 0)
		cors_whitelist = config.legal_urls.cors_origins

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
