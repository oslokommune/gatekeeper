const queryString = require('query-string')

const config = require('./config')
const { log } = require('./logging')
const { UpstreamError } = require('./api_proxy_middleware')

/*
 * Wraps a route in a promise to be able to catch both async and non-async errors in the same
 * way. Passes all uncatched errors down the express event stream to the general error handler.
 */
const asyncErrorMiddleware = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next)

function generateErrorRedirect(status, message) {
	let url = config.error_url

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
	let statusCode = 500

	if (error instanceof UpstreamError) statusCode = 502

	res.status(statusCode).end()
}

module.exports = {
	generateErrorRedirect,
	generalErrorHandler,
	asyncErrorMiddleware
}
