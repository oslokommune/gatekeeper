const url = require('url')

const { generateErrorRedirect, asyncErrorMiddleware } = require('../../error')
const cookies = require('../../cookies')
const { generateState } = require('../../state')
const storage = require('../../storage')
const { ValidationError, verifyLegalLoginUrl } = require('../../validators')

function redirectUser(authorization_endpoint, redirect_uri, state, res) {
	return res.redirect(
		url.format({
			pathname: authorization_endpoint,
			query: {
				client_id: process.env.CLIENT_ID,
				response_type: 'code',
				redirect_uri,
				scope: 'offline_access openid',
				state
			}
		})
	)
}

function errorHandler(error, req, res, next) {
	if (error instanceof ValidationError)
		res.redirect(generateErrorRedirect(400, error.name))
	else if (error instanceof storage.StorageError)
		res.redirect(generateErrorRedirect(500, error.name))
	else next(error)
}

function setupLoginHandler(authorization_endpoint, redirect_uri) {
	return async (req, res) => {
		const redirect = req.query.redirect

		verifyLegalLoginUrl(redirect)

		const state_data = await generateState()
		cookies.setStateId(res, state_data.id)

		await storage.putRedirect(state_data.id, redirect)

		redirectUser(authorization_endpoint, redirect_uri, state_data.state, res)
	}
}

module.exports = (authorization_endpoint, redirect_uri) => {
	return [
		asyncErrorMiddleware(setupLoginHandler(authorization_endpoint, redirect_uri)),
		errorHandler
	]
}
