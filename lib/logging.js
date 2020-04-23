const winston = require('winston')
const expressWinston = require('express-winston')
const { combine, timestamp, prettyPrint, json } = winston.format

const formatting = [json(), timestamp()]
if (process.env.LOG_PRETTY_PRINT)
	formatting.push(prettyPrint())

const options = {
	level: (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'info',
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

const MetricType = Object.freeze({
	SUCCESSFUL_LOGIN: 'successful_login',
	isLegalType(type) {
		return Object.keys(this).some(key => this[key] === type)
	}
})

function logMetric(type, value) {
	if (!MetricType.isLegalType(type)) throw new Error('Invalid log metric type')

	const meta = { type }

	if (value) meta.value = value

	log.info('metric', meta)
}

module.exports = {
	log,
	logMetric,
	MetricType,
	requestLogMiddleware,
}
