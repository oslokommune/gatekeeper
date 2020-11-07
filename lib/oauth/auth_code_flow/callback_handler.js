const axios = require('axios')
const queryString = require('query-string')

const config = require('../../config')
const cookies = require('../../cookies')
const { generateErrorRedirect, asyncErrorMiddleware } = require('../../error')
const {
	createTaggedDebugLogger,
	logMetric,
	MetricType
} = require('../../logging')
const {
	StateVerificationError,
	deleteState,
	verifyState
} = require('../../state')
const storage = require('../../storage')
const {
	ValidationError,
	verifyLegalNanoid,
	verifyLegalCode
} = require('../../validators')

const LOG_TAG = 'code_auth_flow/callback_handler'
const debug = createTaggedDebugLogger(LOG_TAG)

async function getTokenFromCode(token_endpoint, redirect_uri, code) {
	const { data } = await axios.request({
		method: 'POST',
		url: token_endpoint,
		data: queryString.stringify({
			grant_type: 'authorization_code',
			response_type: 'token',
			client_id: config.oauth.client_id,
			client_secret: config.oauth.client_secret,
			redirect_uri,
			code
		})
	})

	return {
		access_token: data.access_token,
		refresh_token: data.refresh_token,
		expires_in: data.expires_in
	}
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

function errorHandler(error, req, res, next) {
	if (error instanceof ValidationError)
		return res.redirect(generateErrorRedirect(400, error.name))
	if (error instanceof StateVerificationError)
		return res.redirect(generateErrorRedirect(400, error.name))

	if (error.response && error.response.data.error === 'invalid_grant')
		return res.redirect(generateErrorRedirect(400, error.name))

	next(error)
}

function setupCodeExchangeHandler(token_endpoint, redirect_uri) {
	return async (req, res) => {
		debug('Start')
		const { state_id, state, code } = ensureSafeInput(req)

		await verifyState(state_id, state)
		cookies.clearStateId(res)

		const { access_token, refresh_token, expires_in } = await getTokenFromCode(
			token_endpoint,
			redirect_uri,
			code
		)
		cookies.setAccessToken(res, access_token, expires_in)
		cookies.setRefreshToken(res, refresh_token)

		await deleteState(state_id)

		const redirect = await storage.getRedirect(state_id)
		await storage.deleteRedirect(state_id)

		res.redirect(redirect)
		logMetric(MetricType.SUCCESSFUL_LOGIN)
		debug('Finish')
	}
}

module.exports = (token_endpoint, redirect_uri) => {
	return [
		asyncErrorMiddleware(setupCodeExchangeHandler(token_endpoint, redirect_uri)),
		errorHandler
	]
}
