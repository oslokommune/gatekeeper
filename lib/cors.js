const cors = require('cors')

const CORS_WHITELIST = []

if (process.env.CORS_ORIGINS.indexOf(';') === -1) CORS_WHITELIST.push(process.env.CORS_ORIGINS)
else process.env.CORS_ORIGINS.split(';').map(origin => CORS_WHITELIST.push(origin))

function validateOrigin(origin, callback) {
	// Origin often undefined during machine-to-machine communications (which is what is happening nuxt server side)
	if (CORS_WHITELIST.indexOf(origin) !== -1 || !origin)
		callback(null, true)
	else
		callback(new Error('Not allowed by CORS'))
}

const corsOptions = {
	credentials: true,
	origin: validateOrigin
}

module.exports = {
	middleware: cors(corsOptions),
}
