const axios = require('axios')
const jwtDecode = require('jwt-decode')
const queryString = require('querystring')

const cookies = require('../cookies')
const { asyncErrorMiddleware } = require('../error')
const { ValidationError } = require('../validators')
const { verifyLegalJWTToken } = require('../validators')

const TIME_SLACK_MILLIS = 500

function hasExpired(token) {
	const now = Date.now()
	const tokenExpiresAt = jwtDecode(token).exp * 1000

	return now > tokenExpiresAt - TIME_SLACK_MILLIS
}

async function fetchNewTokens(token_endpoint, refresh_token) {
	const { data } = await axios.request({
		method: 'POST',
		url: token_endpoint,
		data: queryString.stringify({
			grant_type: 'refresh_token',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			refresh_token
		})
	})

	return { access_token: data.access_token, refresh_token: data.refresh_token }
}

function errorHandler(error, req, res, next) {
	if (error instanceof ValidationError)
		res.status(400).end()
	else
		next(error)
}

function setupTokenRefreshHandler(token_endpoint) {
	return async (req, res, next) => {
		const current_access_token = cookies.getAccessToken(req)
		const current_refresh_token = cookies.getRefreshToken(req)

		if (!current_access_token || !current_refresh_token) return next()

		verifyLegalJWTToken(current_access_token)
		verifyLegalJWTToken(current_refresh_token)

		if (hasExpired(current_refresh_token)) {
			cookies.clearAccessToken(res)
			cookies.clearRefreshToken(res)

			return next()
		}

		if (!hasExpired(current_access_token)) return next()

		const { access_token, refresh_token } = await fetchNewTokens(token_endpoint, current_refresh_token)

		req.cookies['access_token'] = access_token
		req.cookies['refresh_token'] = refresh_token

		cookies.setAccessToken(res, access_token)
		cookies.setRefreshToken(res, refresh_token)

		return next()
	}
}

module.exports = (token_endpoint) => {
	return [
		asyncErrorMiddleware(setupTokenRefreshHandler(token_endpoint)),
		errorHandler
	]
}
