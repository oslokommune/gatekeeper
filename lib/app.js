require('dotenv').config()

const axios = require('axios')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')

const authCodeFlow = require('./oauth/auth_code_flow.js')
const { generalErrorHandler } = require('./error')
const log = require('./logging')
const proxyInstaller = require('./api_proxy_middleware.js')
const tokenRefreshMiddleware = require('./oauth/token_refresh_middleware')
const userinfoHandler = require('./oauth/userinfo')

async function getOIDCConfig(url) {
	const { data } = await axios.get(url)

	return data
}

async function App() {
	let oidc_config = null

	try {
		oidc_config = await getOIDCConfig(process.env.DISCOVERY_URL)
	}
	catch (error) {
		log.error('Could not reach discovery url')
		log.error(error)

		return process.exit(1)
	}

	const app = express()

	// Health check
	app.get('/health', (req, res) => res.status(200).end())

	// Middleware
	app.use(cors({
		origin: process.env.CORS_ORIGINS,
		credentials: true
	}))
	app.use(cookieParser())

	// OAuth handling
	app.use(tokenRefreshMiddleware(oidc_config.token_endpoint))
	app.get('/userinfo', userinfoHandler(oidc_config.userinfo_endpoint))
	app.use(authCodeFlow(oidc_config))
	app.use(generalErrorHandler)

	 /*
		* Create routes to proxy backend service requests.
		* For instance, a route will be created from /api/mybackend to http://myapp.com/mysite based
		* on the configuration of the UPSTREAMS environment variable.
		*/
	proxyInstaller(app)

	return app
}

module.exports = {
	App
}
