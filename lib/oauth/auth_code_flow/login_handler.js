const url = require('url')

const { generateErrorRedirect } = require('../../error_handler')
const cookies = require('../../cookies')
const log = require('../../logging')
const { generateState } = require('../../state')
const storage = require('../../storage')
const { ValidationError, verifyLegalLoginUrl } = require('../../validators')

function redirectUser(authorization_endpoint, redirect_uri, state, res) {
	return res.redirect(url.format({
		pathname: authorization_endpoint,
		query: {
			client_id: process.env.CLIENT_ID,
			response_type: 'code',
			redirect_uri,
			state
		}
	}))
}

function setupLoginHandler(authorization_endpoint, redirect_uri) {
	return async (req, res) => {
		const redirect = req.query.redirect

		verifyLegalLoginUrl(redirect)

		const state_data = await generateState()
		cookies.setStateId(res, state_data.id)

		await storage.putRedirect(state_data.id, redirect)

		return redirectUser(authorization_endpoint, redirect_uri, state_data.state, res)
	}
}

module.exports = (authorization_endpoint, redirect_uri) => {
	const loginHandler = setupLoginHandler(authorization_endpoint, redirect_uri)

	return async (req, res) => {
		try {
			return await loginHandler(req, res)
		}
		catch (error) {
			log.e(error)

			if (error instanceof ValidationError)
				return res.redirect(generateErrorRedirect(400, error.name))
			if (error instanceof storage.StorageError)
				return res.redirect(generateErrorRedirect(500, error.name))
		}
	}
}
