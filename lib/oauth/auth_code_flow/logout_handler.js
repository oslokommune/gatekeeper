const axios = require('axios')
const queryString = require('query-string')

const cookies = require('../../cookies')
const { log } = require('../../logging')
const { asyncErrorMiddleware } = require('../../error')
const { ValidationError, verifyLegalToken } = require('../../validators')

function clearAuthenticationTokens(res) {
	cookies.clearAccessToken(res)
	cookies.clearRefreshToken(res)
}

async function logoutUserInBroker(logout_url, refresh_token) {
	await axios({
		url: logout_url,
		method: 'POST',
		data: queryString.stringify({
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
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
		log.debug('[code_auth_flow/logout_handler]: Start')
		const refresh_token = cookies.getRefreshToken(req)

		if (!refresh_token) return res.status(400).end()

		verifyLegalToken(refresh_token)

		await logoutUserInBroker(end_session_endpoint, refresh_token)

		clearAuthenticationTokens(res)

		res.status(200).end()
		log.debug('[code_auth_flow/logout_handler]: Finish')
	}
}

module.exports = (end_session_endpoint) => {
	return [
		asyncErrorMiddleware(setupLogoutHandler(end_session_endpoint)),
		errorHandler
	]
}
