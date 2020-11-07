const proxy = require('express-http-proxy')

const config = require('./config')
const cookies = require('./cookies')
const { log } = require('./logging')

const routeToUpstreamMap = createRouteToUpstreamMap(config.upstreams)

class UpstreamError extends Error {
	constructor(error) {
		super(error)

		this.name = 'UpstreamError'
		this.error = error
	}
}

function proxyErrorHandler(error, res, next) {
	next(new UpstreamError(error))
}

function createRouteToUpstreamMap(upstream_list = []) {
	const routeToUpstreamMap = {}

	upstream_list.forEach((item) => {
		if (!item) return

		const [route, upstream] = item.split('=')

		routeToUpstreamMap[route] = upstream
	})

	return routeToUpstreamMap
}

function clearAccessControlAllowOrigin(headers) {
	const newHeaders = { ...headers }

	Object.keys(newHeaders).forEach((header) => {
		if (header.toLowerCase() === 'access-control-allow-origin')
			delete newHeaders[header]
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

function userResDecorator(proxyRes, proxyResData, userReq, userRes) {
	const statusCode = proxyRes.statusCode

	if (statusCode <= 400) return proxyResData

	const route = userReq.baseUrl.replace('/api/', '')

	log.warn('Bad response from upstream', {
		upstream: {
			url: `${routeToUpstreamMap[route]}/${proxyRes.originalUrl || ''}`,
			message: proxyRes.statusMessage,
			statusCode
		},
		client_request: {
			url: `${config.base_url}${userReq.originalUrl}`
		}
	})

	return proxyResData
}

function generateProxy(upstream_url) {
	return proxy(upstream_url, {
		proxyReqOptDecorator: cookieToHeaderDecorator,
		userResHeaderDecorator: removeServiceCorsHeadersDecorator,
		userResDecorator,
		proxyErrorHandler,
		limit: '20mb'
	})
}

function proxyInstaller(app) {
	const routes = Object.keys(routeToUpstreamMap)

	routes.forEach((route) => {
		log.debug(
			`Generating proxy for route ${route} to ${routeToUpstreamMap[route]}`
		)
		const upstream_url = routeToUpstreamMap[route]

		app.use(`/api/${route}`, generateProxy(upstream_url))
	})
}

module.exports = {
	proxyInstaller,
	UpstreamError
}
