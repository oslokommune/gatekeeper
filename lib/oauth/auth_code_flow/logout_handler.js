const axios = require('axios')
const queryString = require('query-string')

const cookies = require('../../cookies')
const { ValidationError, verifyLegalJWTToken } = require('../../validators')

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

function setupLogoutHandler(end_session_endpoint) {
	return async (req, res) => {
		const refresh_token = cookies.getRefreshToken(req)

		if (!refresh_token)
			return res.status(400).end()

		verifyLegalJWTToken(refresh_token)

		await logoutUserInBroker(end_session_endpoint, refresh_token)

		clearAuthenticationTokens(res)

		res.status(200).end()
	}
}

module.exports = (end_session_endpoint) => {
	const logoutHandler = setupLogoutHandler(end_session_endpoint)

	return async (req, res) => {
		try {
			return await logoutHandler(req, res)
		}
		catch (error) {
			log.e(error)

			if (error instanceof ValidationError)
				return res.status(400).end()

			return res.status(500).end()
		}
	}
}
