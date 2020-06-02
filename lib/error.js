const queryString = require('query-string')

const { log } = require('./logging')

/*
 * Wraps a route in a promise to be able to catch both async and non-async errors in the same
 * way. Passes all uncatched errors down the express event stream to the general error handler.
 */
const asyncErrorMiddleware = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next)

function generateErrorRedirect(status, message) {
	let url = process.env.ERROR_URL

	url +=
		'?' +
		queryString.stringify({
			status: encodeURIComponent(status),
			message: encodeURIComponent(message)
		})

	return url
}

function generalErrorHandler(error, req, res, next) {
	log.error(error)

	res.status(500).end()
}

module.exports = {
	generateErrorRedirect,
	generalErrorHandler,
	asyncErrorMiddleware
}
