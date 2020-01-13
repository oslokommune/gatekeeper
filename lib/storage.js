// Third party libs
const redis = require('redis')

// Project libs
const log = require('./logging')

// Constants
const MAX_RECONNECT_TIME_MILLIS = 1000 * 60 * 60 // 1 hour
const EXPIRY_SECONDS = 60 * 60 // 1 hour
const PREFIX = 'gatekeeper'

class StorageError extends Error {
	constructor(message) {
		super(message)

		this.name = 'StorageError'
	}
}

const redisOptions = {
	url: process.env.REDIS_URI,
	retry_strategy: (options) => {
		log.e(options)
		if (options.error && options.error.code === 'ECONNREFUSED') {
			if (options.times_connected === 0)
				throw new StorageError('Unable to connect to Redis')
		}

		if (options.total_retry_time > MAX_RECONNECT_TIME_MILLIS) {
			// End reconnecting after MAX_RECONNECT_TIME_MILLIS
			throw new StorageError('Retry time exhausted')
		}

		return Math.min(options.attempt * 100, 3000)
	}
}
if (process.env.REDIS_PASSWORD)
	redisOptions.password = process.env.REDIS_PASSWORD

const client = redis.createClient(redisOptions)
client.on('error', error => {
	log.e(`${error.name}: ${error.message}`)
})

function getRedirect(id) {
	return new Promise((resolve, reject) => {
		const key = [PREFIX, id, 'redirect'].join(':')

		client.get(key, (err, result) => {
			if (err) {
				const error = new StorageError('Unable to get redirect')

				error.original_error = err

				reject(error)
			}
			else resolve(result)
		})
	})
}
function putRedirect(id, redirect_url) {
	return new Promise((resolve, reject) => {
		const key = [PREFIX, id, 'redirect'].join(':')

		client.set([key, redirect_url, 'EX', EXPIRY_SECONDS], (err, result) => {
			if (err) {
				const error = new StorageError('Unable to store redirect')

				error.original_error = err

				reject(error)
			}
			else resolve(result)
		})
	})
}
function deleteRedirect(id) {
	return new Promise((resolve, reject) => {
		const key = [PREFIX, id, 'redirect'].join(':')

		client.del(key, err => {
			if (err) {
				const error = new StorageError('Unable to delete redirect')

				error.original_error = err

				reject(error)
			}
			else resolve()
		})
	})
}

function getState(id) {
	return new Promise((resolve, reject) => {
		const key = [PREFIX, id, 'state'].join(':')

		client.get(key, (err, result) => {
			if (err) {
				const error = new StorageError('Unable to get state')

				error.original_error = err

				reject(error)
			}
			else resolve(result)
		})
	})
}
function putState(id, state) {
	return new Promise((resolve, reject) => {
		const key = [PREFIX, id, 'state'].join(':')

		client.set([key, state, 'EX', EXPIRY_SECONDS], (err, result) => {
			if (err) {
				const error = new StorageError('Unable to save state')

				error.original_error = err

				reject(error)
			}
			else resolve(result)
		})
	})
}

function deleteState(id) {
	return new Promise((resolve, reject) => {
		const key = [PREFIX, id, 'state'].join(':')

		client.del(key, err => {
			if (err) {
				const error = new StorageError('Unable to delete state')

				error.original_error = err

				reject(error)
			}
			else resolve()
		})
	})
}

module.exports = {
	getRedirect,
	putRedirect,
	deleteRedirect,
	getState,
	putState,
	deleteState,
	StorageError
}
