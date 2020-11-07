const winston = require('winston')
const expressWinston = require('express-winston')
const { combine, timestamp, prettyPrint, json } = winston.format

const config = require('./config')

const formatting = [json(), timestamp()]
if (config.logging.pretty_print) formatting.push(prettyPrint())

const options = {
	level: config.logging.log_level,
	format: combine(...formatting),
	defaultMeta: { service: 'gatekeeper' },
	transports: [new winston.transports.Console()]
}

const log = new winston.createLogger({
	...options,
	exceptionHandlers: [new winston.transports.Console()]
})

const requestLogMiddleware = expressWinston.logger({
	...options,
	headerBlacklist: ['cookie', 'authorization']
})

const MetricType = Object.freeze({
	SUCCESSFUL_LOGIN: 'successful_login',
	isLegalType(type) {
		return Object.keys(this).some((key) => this[key] === type)
	}
})

function logMetric(type, value) {
	if (!MetricType.isLegalType(type)) throw new Error('Invalid log metric type')

	const meta = { '@timestamp': new Date().toISOString(), type }

	if (value) meta.value = value

	log.info('metric', meta)
}

function createTaggedDebugLogger(log_tag) {
	return (message) => {
		log.debug(`[${log_tag}]: ${message}`)
	}
}

module.exports = {
	createTaggedDebugLogger,
	log,
	logMetric,
	MetricType,
	requestLogMiddleware
}
