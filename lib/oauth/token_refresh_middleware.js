const axios = require('axios')
const queryString = require('querystring')

const cookies = require('../cookies')
const { asyncErrorMiddleware } = require('../error')
const log = require('../logging')
const { ValidationError } = require('../validators')
const { verifyLegalToken } = require('../validators')

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

	return data
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

		if (current_access_token) verifyLegalToken(current_access_token)
		if (current_refresh_token) verifyLegalToken(current_refresh_token)

		if (current_access_token || !current_refresh_token) return next()

		let fresh
		try {
			fresh = await fetchNewTokens(token_endpoint, current_refresh_token)
		}
		catch (error) {
			if (error.response && error.response.data.error === 'invalid_grant') {
				log.debug('Offline(refresh) token has become invalid. Cleaning up')
				cookies.clearAccessToken(res)
				cookies.clearRefreshToken(res)

				delete req.cookies['access_token']
				delete req.cookies['refresh_token']
			}
			else log.error(error)

			return next()
		}

		req.cookies['access_token'] = fresh.access_token
		cookies.setAccessToken(res, fresh.access_token, fresh.expires_in)

		if (fresh.refresh_token) {
			cookies.setRefreshToken(res, fresh.refresh_token)
			req.cookies['refresh_token'] = fresh.refresh_token
		}

		next()
	}
}

module.exports = (token_endpoint) => {
	return [
		asyncErrorMiddleware(setupTokenRefreshHandler(token_endpoint)),
		errorHandler
	]
}
