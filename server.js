require('dotenv').config()

const fs = require('fs')
const http = require('http')
const https = require('https')

const config = require('./lib/config')
const { App } = require('./lib/app')
const { log } = require('./lib/logging')

let credentials = null

if (config.ssl) {
	try {
		const privateKey = fs.readFileSync(config.key_file, 'utf8')
		const certificate = fs.readFileSync(config.certificate_file, 'utf8')

		credentials = {
			key: privateKey,
			cert: certificate
		}
	} catch (error) {
		log.error('Unable to read key or certificate')
		log.error(error)

		return
	}
}

App().then((app) => {
	let server
	let protocol

	if (credentials) {
		protocol = 'https'
		server = https.createServer(credentials, app)
	} else {
		protocol = 'http'
		server = http.createServer(app)
	}

	server.listen(config.listening_port, () => {
		log.verbose(`Listening on ${protocol}://0.0.0.0:${config.listening_port}`)
	})
})
