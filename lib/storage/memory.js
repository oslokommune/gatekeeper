class MemoryStorage {
	constructor(data_expiry_seconds) {
		if (!MemoryStorage.instance) {
			this.redirects = {}
			this.states = {}
			this.expiries = {}
			this.data_expiry_seconds = data_expiry_seconds || 60 * 60

			MemoryStorage.instance = this
		}

		return MemoryStorage.instance
	}

	async getState(id) {
		return this.states[id]
	}
	async putState(id, state) {
		this.states[id] = state

		this.expiries[`state:${id}`] = setTimeout(
			() => this.deleteState(id),
			this.data_expiry_seconds * 1000
		)
	}
	async deleteState(id) {
		delete this.states[id]

		const expiryKey = `state:${id}`
		clearTimeout(this.expiries[expiryKey])
		delete this.expiries[expiryKey]
	}

	async getRedirect(id) {
		return this.redirects[id]
	}
	async putRedirect(id, redirect_url) {
		this.redirects[id] = redirect_url

		this.expiries[`redirect:${id}`] = setTimeout(
			() => this.deleteState(id),
			this.data_expiry_seconds * 1000
		)
	}
	async deleteRedirect(id) {
		delete this.redirects[id]

		const expiryKey = `redirect:${id}`
		clearTimeout(this.expiries[expiryKey])
		delete this.expiries[expiryKey]
	}
}

module.exports = MemoryStorage
