const axios = require('axios')
const queryString = require('query-string')

const cookies = require('../../cookies')
const { generateErrorRedirect } = require('../../error_handler')
const log = require('../../logging')
const { StateVerificationError, deleteState, verifyState } = require('../../state')
const storage = require('../../storage')
const { ValidationError, verifyLegalNanoid, verifyLegalCode } = require('../../validators')

async function getTokenFromCode(token_endpoint, redirect_uri, code) {
	const { data } = await axios.request({
		method: 'POST',
		url: token_endpoint,
		data: queryString.stringify({
			grant_type: 'authorization_code',
			response_type: 'token',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri,
			code
		})
	})

	return { access_token: data.access_token, refresh_token: data.refresh_token }
}

function ensureSafeInput(req) {
	const state_id = cookies.getStateId(req)
	const state = req.query.state
	const code = req.query.code

	verifyLegalNanoid(state_id)
	verifyLegalNanoid(state)
	verifyLegalCode(code)

	return { state_id, state, code }
}

function setupCodeExchangeHandler(token_endpoint, redirect_uri) {
	return async (req, res) => {
		const { state_id, state, code } = ensureSafeInput(req)

		await verifyState(state_id, state)
		await deleteState(state_id)
		cookies.clearStateId(res)

		const { access_token, refresh_token } = await getTokenFromCode(token_endpoint, redirect_uri, code)
		cookies.setAccessToken(res, access_token)
		cookies.setRefreshToken(res, refresh_token)

		const redirect = await storage.getRedirect(state_id)
		await storage.deleteRedirect(state_id)

		return res.redirect(redirect)
	}
}

module.exports = (token_endpoint, redirect_uri) => {
	const codeExchangeHandler = setupCodeExchangeHandler(token_endpoint, redirect_uri)

	return async (req, res) => {
		try {
			return await codeExchangeHandler(req, res)
		}
		catch (error) {
			log.e(error)

			if (error instanceof ValidationError)
				return res.redirect(generateErrorRedirect(400, error.name))
			if (error instanceof StateVerificationError)
				return res.redirect(generateErrorRedirect(400, error.name))

			if (error.response && error.response.data.error === 'invalid_grant')
				return res.redirect(generateErrorRedirect(400, error.name))

			return res.redirect(generateErrorRedirect(500, error.name))
		}
	}
}
