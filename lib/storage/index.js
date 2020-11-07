// Project libs
const config = require('../config')
const { log } = require('../logging')
const RedisStorage = require('./redis')
const MemoryStorage = require('./memory')

// Constants
const EXPIRY_SECONDS = 60 * 60 // 1 hour

function getClient(data_expiry_seconds) {
	if (config.redis) {
		log.debug(`Redis URI ${config.redis.uri} found. Using Redis Storage.`)
		return new RedisStorage(
			data_expiry_seconds,
			config.redis.uri,
			config.redis.password
		)
	}

	return new MemoryStorage(data_expiry_seconds)
}

const client = getClient(EXPIRY_SECONDS)

module.exports = client
