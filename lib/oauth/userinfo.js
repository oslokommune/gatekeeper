const axios = require('axios')
const cookies = require('../cookies')
const { asyncErrorMiddleware } = require('../error')

function errorHandler(error, req, res, next) {
	if (error.response) {
		if (error.response.status === 401)
			res.status(401).end()
	}
	else next(error)
}

function setupUserinfoHandler(userinfo_endpoint) {
	return async (req, res) => {
		const access_token = cookies.getAccessToken(req)

		if (!access_token)
			return res.status(401).end()

		const { data } = await axios.request({
			url: userinfo_endpoint,
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		})

		res.json(data).end()
	}
}

module.exports = (userinfo_endpoint) => {
	return [
		asyncErrorMiddleware(setupUserinfoHandler(userinfo_endpoint)),
		errorHandler
	]
}
