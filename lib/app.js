require('dotenv').config()

const axios = require('axios')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')

const authCodeFlow = require('./oauth/auth_code_flow.js')
const log = require('./logging')
const proxyInstaller = require('./api_proxy_middleware.js')
const tokenRefreshMiddleware = require('./oauth/token_refresh_middleware')

async function App() {
	let oidc_config = null

	try {
		const { data } = await axios.request({
			method: 'GET',
			url: process.env.DISCOVERY_URL
		})

		oidc_config = data
	}
	catch(error) {
		log.e('Could not reach discovery url')
		log.e(error)

		process.exit(1)
	}

	const app = express()

	// Middleware
	app.use(cors({
		origin: process.env.CORS_ORIGINS,
		credentials: true
	}))
	app.use(cookieParser())

	// OAuth handling
	app.use(authCodeFlow(oidc_config))
	app.use(tokenRefreshMiddleware(oidc_config))

	// Service proxy
	proxyInstaller(app)

	return app
}

module.exports = {
	App
}
