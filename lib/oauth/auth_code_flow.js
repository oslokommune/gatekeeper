// Third party libraries
const express = require('express')
const urljoin = require('urljoin')

// Project libraries
const loginHandler = require('./auth_code_flow/login_handler')
const logoutHandler = require('./auth_code_flow/logout_handler')
const callbackHandler =  require('./auth_code_flow/callback_handler')

// Constants
const REDIRECT_URI = urljoin(process.env.BASE_URL, 'callback')

module.exports = (oidc_config) => {
	const router = express.Router()

	router.get('/login', loginHandler(oidc_config.authorization_endpoint, REDIRECT_URI))
	router.get('/callback', callbackHandler(oidc_config.token_endpoint, REDIRECT_URI))
	router.post('/logout', logoutHandler(oidc_config.end_session_endpoint))

	return router
}
