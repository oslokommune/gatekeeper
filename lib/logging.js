const winston = require('winston')
const expressWinston = require('express-winston')
const { combine, timestamp, prettyPrint, json } = winston.format

const formatting = [json(), timestamp()]
if (process.env.LOG_PRETTY_PRINT)
	formatting.push(prettyPrint())

const options = {
	level: (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'error',
	format: combine(...formatting),
	defaultMeta: { service: 'gatekeeper' },
	transports: [
		new winston.transports.Console()
	],
}

const log = new winston.createLogger({
	...options,
	exceptionHandlers: [
		new winston.transports.Console()
	]
})

const requestLogMiddleware = expressWinston.logger({
	...options,
	headerBlacklist: ['cookie', 'authorization']
})

module.exports = {
	log,
	requestLogMiddleware
}
