require('dotenv').config()

const fs = require('fs')
const http = require('http')
const https = require('https')

const { App } = require('./lib/app')
const { log } = require('./lib/logging')

const PORT = 4554

let credentials = null

if (process.env.CERTIFICATE_FILE || process.env.KEY_FILE) {
	if (!process.env.CERTIFICATE_FILE || !process.env.KEY_FILE)
		throw new Error('SSL requires both a certificate and a key')

	try {
		const privateKey = fs.readFileSync(process.env.KEY_FILE, 'utf8')
		const certificate = fs.readFileSync(process.env.CERTIFICATE_FILE, 'utf8')

		credentials = {
			key: privateKey, cert: certificate
		}
	} catch(error) {
		log.error('Unable to read key or certificate')
		log.error(error)

		return
	}
}

App()
	.then(app => {
		let server
		let protocol

		if (credentials) {
			protocol = 'https'
			server = https.createServer(credentials, app)
		}
		else {
			protocol = 'http'
			server = http.createServer(app)
		}

		server.listen(PORT, () => {
			log.verbose(`Listening on ${protocol}://0.0.0.0:${PORT}`)
		})
	})

