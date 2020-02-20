const proxy = require('express-http-proxy')

const cookies = require('./cookies')

const ROUTE_TO_UPSTREAM_MAP = {} // { 'api-catalog': 'http://api-catalog.mycluster.com' }
process.env.UPSTREAMS.split(';').forEach(item => {
	if (!item) return

	const [ route, upstream ] = item.split('=')

	ROUTE_TO_UPSTREAM_MAP[route] = upstream
})

function cookieToHeaderDecorator(proxy_request_options, source_request) {
	const access_token = cookies.getAccessToken(source_request)

	if (access_token)
		proxy_request_options.headers['Authorization'] = `Bearer ${access_token}`

	return proxy_request_options
}

function removeServiceCorsHeadersDecorator(headers) {
	if (headers['access-control-allow-origin']) delete headers['access-control-allow-origin']

	return headers
}

function generateProxy(upstream_url) {
	return proxy(upstream_url, {
		proxyReqOptDecorator: cookieToHeaderDecorator,
		userResHeaderDecorator: removeServiceCorsHeadersDecorator
	})
}

function proxyInstaller(app) {
	const routes = Object.keys(ROUTE_TO_UPSTREAM_MAP)

	routes.forEach(route => {
		const upstream_url = ROUTE_TO_UPSTREAM_MAP[route]

		app.use(`/api/${route}`, generateProxy(upstream_url))
	})
}

module.exports = proxyInstaller
