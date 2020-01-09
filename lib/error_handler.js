const queryString = require('query-string')

function generateErrorRedirect(status, message) {
	let url = process.env.ERROR_URL

	url += '?' + queryString.stringify({
		status: encodeURIComponent(status),
		message: encodeURIComponent(message)
	})

	return url
}

module.exports = {
	generateErrorRedirect
}
