// Project libs
const { log } = require('../logging')
const RedisStorage = require('./redis')
const MemoryStorage = require('./memory')

// Constants
const EXPIRY_SECONDS = 60 * 60 // 1 hour

function getClient(data_expiry_seconds) {
	const redis_uri = process.env.REDIS_URI
	const redis_password = process.env.REDIS_PASSWORD

	if (redis_uri) {
		log.debug(`Redis URI ${redis_uri} found. Using Redis Storage.`)
		return new RedisStorage(data_expiry_seconds, redis_uri, redis_password)
	}

	return new MemoryStorage(data_expiry_seconds)
}

const client = getClient(EXPIRY_SECONDS)

module.exports = client
