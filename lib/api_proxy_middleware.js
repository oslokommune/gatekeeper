const proxy = require('express-http-proxy')

const cookies = require('./cookies')
const { log } = require('./logging')

function createRouteToUpstreamMap(raw_string = '') {
	const stripped = raw_string
		.replace(/\s/g, '')
		.replace(/"/g, '')

	const itemsToParse = stripped.split(';')
	const routeToUpstreamMap = {}

	itemsToParse.forEach(item => {
		if (!item) return

		const [ route, upstream ] = item.split('=')

		routeToUpstreamMap[route] = upstream
	})

	return routeToUpstreamMap
}

function clearAccessControlAllowOrigin(headers) {
	const newHeaders = { ...headers }

	Object.keys(newHeaders).forEach(header => {
		if (header.toLowerCase() === 'access-control-allow-origin') delete newHeaders[header]
	})

	return newHeaders
}

function cookieToHeaderDecorator(proxy_request_options, source_request) {
	const access_token = cookies.getAccessToken(source_request)

	if (access_token)
		proxy_request_options.headers['Authorization'] = `Bearer ${access_token}`

	return proxy_request_options
}

function removeServiceCorsHeadersDecorator(headers, userReq) {
	if (!userReq.headers.origin) return headers

	headers = clearAccessControlAllowOrigin(headers)
	headers['access-control-allow-origin'] = userReq.headers.origin

	return headers
}

function generateProxy(upstream_url) {
	return proxy(upstream_url, {
		proxyReqOptDecorator: cookieToHeaderDecorator,
		userResHeaderDecorator: removeServiceCorsHeadersDecorator
	})
}

function proxyInstaller(app) {
	const routeToUpstreamMap = createRouteToUpstreamMap(process.env.UPSTREAMS)
	const routes = Object.keys(routeToUpstreamMap)

	routes.forEach(route => {
		log.debug(`Generating proxy for route ${route} to ${routeToUpstreamMap[route]}`)
		const upstream_url = routeToUpstreamMap[route]

		app.use(`/api/${route}`, generateProxy(upstream_url))
	})
}

module.exports = proxyInstaller
