// Third party libs
const { nanoid } = require('nanoid')

// Project libs
const { log } = require('./logging')
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
	log.debug(`Generated state '${state}' with id '${id}'`)

	await storage.putState(id, state)

	return { id, state }
}

async function verifyState(state_id, state) {
	const saved_state = await storage.getState(state_id)
	log.debug(`Comparing state '${state}' with '${saved_state}'`)

	if (saved_state !== state) {
		const error = new StateVerificationError('State verification failed')

		error.given_state = state
		error.saved_state = saved_state

		throw error
	}
}

async function deleteState(state_id) {
	log.debug(`Deleting state with id '${state_id}'`)
	await storage.deleteState((state_id))
}

module.exports = {
	generateState,
	verifyState,
	deleteState,
	StateVerificationError
}
