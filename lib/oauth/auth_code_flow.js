// Third party libraries
const axios = require('axios')
const express = require('express')
const queryString = require('query-string')
const url = require('url')
const urljoin = require('urljoin')

// Project libraries
const { COOKIE_OPTIONS } = require('../cookies')
const { generateErrorRedirect } = require('../error_handler')
const log = require('../logging')
const { generateState, verifyState, StateVerificationError } = require('../state.js')
const storage = require('../storage')
const {
	verifyLegalCode,
	verifyLegalNanoid,
	verifyLegalLoginUrl,
	verifyLegalJWTToken,
	ValidationError
} = require('../validators')

// Constants
const COOKIE_STATE_ID = 'state_id'
const REDIRECT_URI = urljoin(process.env.BASE_URL, 'callback')

module.exports = (oidc_config) => {
	const router = express.Router()

	router.get('/login', async (req, res) => {
		const redirect = req.query.redirect

		let state_data

		try {
			verifyLegalLoginUrl(redirect)

			state_data = await generateState()
			await storage.putRedirect(state_data.id, redirect)
		}
		catch (error) {
			log.e(error)

			if (error instanceof ValidationError)
				return res.redirect(generateErrorRedirect(400, error.name))

			return res.redirect(generateErrorRedirect(500, error.name))
		}

		const options = Object.assign({ path: '/callback' }, {...COOKIE_OPTIONS})
		res.cookie(COOKIE_STATE_ID, state_data.id, options)

		return res.redirect(url.format({
			pathname: oidc_config.authorization_endpoint,
			query: {
				client_id: process.env.CLIENT_ID,
				redirect_uri: REDIRECT_URI,
				response_type: 'code',
				state: state_data.state
			}
		}))
	})

	router.get('/callback', async (req, res) => {
		const stateId = req.cookies[COOKIE_STATE_ID]
		const state = req.query.state
		const code = req.query.code

		let redirect

		try {
			verifyLegalNanoid(stateId)
			verifyLegalNanoid(state)
			verifyLegalCode(code)
			await verifyState(stateId, state)

			redirect = await storage.getRedirect(stateId)
			await storage.deleteRedirect(stateId)

			res.clearCookie(COOKIE_STATE_ID)
		} catch (error) {
			log.e(error)

			if (error instanceof ValidationError)
				return res.redirect(generateErrorRedirect(400, error.name))
			if (error instanceof StateVerificationError)
				return res.redirect(generateErrorRedirect(400, error.name))

			res.clearCookie(COOKIE_STATE_ID)
			return res.redirect(generateErrorRedirect(400, error.name))
		}

		let data
		try {
			const response = await axios.request({
				method: 'POST',
				url: oidc_config.token_endpoint,
				data: queryString.stringify({
					grant_type: 'authorization_code',
					response_type: 'token',
					redirect_uri: REDIRECT_URI,
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					code
				})
			})

			data = response.data
		}
		catch (error) {
			log.e(error)

			let status = 500
			if (error.response && error.response.data.error === 'invalid_grant')
				status = 400

			return res.redirect(generateErrorRedirect(status, error.name))
		}

		const options = Object.assign({ path: '/' }, {...COOKIE_OPTIONS})
		res.cookie('access_token', data.access_token, options)
		res.cookie('refresh_token', data.refresh_token, options)

		res.redirect(redirect)
	})

	router.post('/logout', async (req, res) => {
		const refresh_token = req.cookies['refresh_token']

		if (!refresh_token)
			return res.status(401).end()

		try {
			verifyLegalJWTToken(refresh_token)

			await axios({
				url: oidc_config.end_session_endpoint,
				method: 'POST',
				data: queryString.stringify({
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					refresh_token
				})
			})

			res.clearCookie('access_token')
			res.clearCookie('refresh_token')
		}
		catch (error) {
			log.e(error)

			if (error instanceof ValidationError)
				return res.status(400).end()

			return res.status(500).end()
		}

		res.status(200).end()
	})

	return router
}
