// Third party libs
const nanoid = require('nanoid')

// Project libs
const storage = require('./storage')

class StateVerificationError extends Error {
	constructor(message) {
		super(message)

		this.name = 'StateVerificationError'
	}
}

async function generateState() {
	const id = nanoid()
	const state = nanoid()

	await storage.putState(id, state)

	return { id, state }
}

async function verifyState(stateId, state) {
	let savedState

	savedState = await storage.getState(stateId)
	await storage.deleteState(stateId)

	if (savedState !== state) {
		const error = new StateVerificationError('State verification failed')

		error.givenState = state
		error.savedState = savedState

		throw error
	}

	return true
}

module.exports = {
	generateState,
	verifyState,
	StateVerificationError
}
