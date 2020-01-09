const axios = require('axios')
const jwtDecode = require('jwt-decode')
const queryString = require('querystring')

const { COOKIE_OPTIONS } = require('../cookies')
const { generateErrorRedirect } = require('../error_handler')
const log = require('../logging')
const { verifyLegalJWTToken } = require('../validators')

const TIME_SLACK_MILLIS = 500

function hasExpired(token) {
	const now = Date.now()
	const tokenExpiresAt = jwtDecode(token).exp * 1000

	return now > tokenExpiresAt - TIME_SLACK_MILLIS
}

async function fetchNewTokens(token_endpoint, refresh_token) {
	const response = await axios.request({
		method: 'POST',
		url: token_endpoint,
		data: queryString.stringify({
			grant_type: 'refresh_token',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			refresh_token
		})
	})

	return response.data
}

module.exports = (oidc_config) => {
	return async function middleware(req, res, next) {
		if (!('access_token' in req.cookies && req.cookies['access_token'])) return next()
		if (!('refresh_token' in req.cookies && req.cookies['refresh_token'])) return next()

		const access_token = req.cookies['access_token']
		const refresh_token = req.cookies['refresh_token']

		try {
			verifyLegalJWTToken(access_token)
			verifyLegalJWTToken(refresh_token)
		}
		catch (error) {
			log.e(error)
			return res.redirect(generateErrorRedirect(400, error.name))
		}

		if (hasExpired(refresh_token)) return next()
		if (!hasExpired(access_token)) return next()

		let data
		try {
			data = await fetchNewTokens(oidc_config.token_endpoint, refresh_token)
		}
		catch(err) {
			log.e(err)

			return res.redirect(generateErrorRedirect(500, err.name))
		}

		req.cookies['access_token'] = data.access_token
		req.cookies['refresh_token'] = data.refresh_token

		const options = Object.assign({ path: '/' }, {...COOKIE_OPTIONS})
		res.cookie('access_token', data.access_token, options)
		res.cookie('refresh_token', data.refresh_token, options)

		return next()
	}
}
