// Third party libs
const redis = require('redis')

// Project libs
const { log } = require('../logging')
const { StorageError } = require('./error')

// Constants
const MAX_RECONNECT_TIME_MILLIS = 1000 * 60 * 60 // 1 hour
const PREFIX = 'gatekeeper'

const REDIS_OPTIONS = {
	retry_strategy: (options) => {
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

class RedisStorage {
	constructor(data_expiry_seconds, url, password) {
		if (!RedisStorage.instance) {
			const options = { ...REDIS_OPTIONS, url }
			if (password) options.password = password

			this.client = redis.createClient(options)
			this.client.on('error', (error) =>
				log.error(`${error.name}: ${error.message}`)
			)

			this.data_expiry_seconds = data_expiry_seconds || 60 * 60

			RedisStorage.instance = this
		}

		return RedisStorage.instance
	}

	getRedirect(id) {
		return new Promise((resolve, reject) => {
			const key = [PREFIX, id, 'redirect'].join(':')

			this.client.get(key, (err, result) => {
				if (err) {
					const error = new StorageError('Unable to get redirect')

					error.original_error = err

					reject(error)
				} else resolve(result)
			})
		})
	}
	putRedirect(id, redirect_url) {
		return new Promise((resolve, reject) => {
			const key = [PREFIX, id, 'redirect'].join(':')

			this.client.set(
				[key, redirect_url, 'EX', this.data_expiry_seconds],
				(err, result) => {
					if (err) {
						const error = new StorageError('Unable to store redirect')

						error.original_error = err

						reject(error)
					} else resolve(result)
				}
			)
		})
	}
	deleteRedirect(id) {
		return new Promise((resolve, reject) => {
			const key = [PREFIX, id, 'redirect'].join(':')

			this.client.del(key, (err) => {
				if (err) {
					const error = new StorageError('Unable to delete redirect')

					error.original_error = err

					reject(error)
				} else resolve()
			})
		})
	}

	getState(id) {
		return new Promise((resolve, reject) => {
			const key = [PREFIX, id, 'state'].join(':')

			this.client.get(key, (err, result) => {
				if (err) {
					const error = new StorageError('Unable to get state')

					error.original_error = err

					reject(error)
				} else resolve(result)
			})
		})
	}
	putState(id, state) {
		return new Promise((resolve, reject) => {
			const key = [PREFIX, id, 'state'].join(':')

			this.client.set(
				[key, state, 'EX', this.data_expiry_seconds],
				(err, result) => {
					if (err) {
						const error = new StorageError('Unable to save state')

						error.original_error = err

						reject(error)
					} else resolve(result)
				}
			)
		})
	}

	deleteState(id) {
		return new Promise((resolve, reject) => {
			const key = [PREFIX, id, 'state'].join(':')

			this.client.del(key, (err) => {
				if (err) {
					const error = new StorageError('Unable to delete state')

					error.original_error = err

					reject(error)
				} else resolve()
			})
		})
	}
}

module.exports = RedisStorage
