const axios = require('axios')
const queryString = require('query-string')

const config = require('../../config')
const cookies = require('../../cookies')
const { createTaggedDebugLogger } = require('../../logging')
const { asyncErrorMiddleware } = require('../../error')
const { ValidationError, verifyLegalToken } = require('../../validators')

const LOG_TAG = 'auth_code_flow/logout_handler'
const debug = createTaggedDebugLogger(LOG_TAG)

function clearAuthenticationTokens(res) {
	cookies.clearAccessToken(res)
	cookies.clearRefreshToken(res)
}

async function logoutUserInBroker(logout_url, refresh_token) {
	await axios({
		url: logout_url,
		method: 'POST',
		data: queryString.stringify({
			client_id: config.oauth.client_id,
			client_secret: config.oauth.client_secret,
			refresh_token
		})
	})
}

function errorHandler(error, req, res, next) {
	if (error instanceof ValidationError) res.status(400).end()
	else next(error)
}

function setupLogoutHandler(end_session_endpoint) {
	return async (req, res) => {
		debug('Start')
		const refresh_token = cookies.getRefreshToken(req)

		if (!refresh_token) return res.status(400).end()

		verifyLegalToken(refresh_token)

		await logoutUserInBroker(end_session_endpoint, refresh_token)

		clearAuthenticationTokens(res)

		res.status(200).end()
		debug('Finish')
	}
}

module.exports = (end_session_endpoint) => {
	return [
		asyncErrorMiddleware(setupLogoutHandler(end_session_endpoint)),
		errorHandler
	]
}
