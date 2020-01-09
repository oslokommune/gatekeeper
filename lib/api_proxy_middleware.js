const proxy = require('express-http-proxy')

const ROUTER = {}
process.env.UPSTREAMS.split(';').forEach(item => {
	const [ route, upstream ] = item.split('=')

	ROUTER[route] = upstream
})

function proxyInstaller(app) {
	Object.keys(ROUTER).forEach(route => {
		app.use(`/api/${route}`, proxy(ROUTER[route], {
			proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
				if ('access_token' in srcReq.cookies && srcReq.cookies['access_token'])
					proxyReqOpts.headers['Authorization'] = `Bearer ${srcReq.cookies['access_token']}`

				return proxyReqOpts
			}
		}))
	})
}

module.exports = proxyInstaller
