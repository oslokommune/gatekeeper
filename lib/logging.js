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

const LogStatementType = Object.freeze({
	SUCCESSFUL_LOGIN: 'successful_login',
	isLegalType(type) {
		return Object.keys(this).some(key => this[key] === type)
	}
})
class LogStatement {
	constructor(type, value) {
		if (!LogStatementType.isLegalType(type)) throw new Error('Invalid log statement type')

		this.type = type
		if (value) this.value = value
	}
	publish() {
		log.info('LogStatement', { ...this })
	}
}

module.exports = {
	log,
	requestLogMiddleware,
	LogStatementType,
	LogStatement
}
