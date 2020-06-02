const storage = require('../storage')
const { generateState, verifyState } = require('../state')

jest.mock('nanoid', () => ({
	nanoid: () => 'secret'
}))
jest.mock('../storage', () => ({
	getState: jest.fn(() => 'stored_state'),
	deleteState: () => {},
	putState: jest.fn()
}))

describe('state.js', () => {
	describe('generateState', () => {
		it('generates a state, saves it and returns a state and id', async () => {
			const { id, state } = await generateState()

			expect(id).toStrictEqual('secret')
			expect(state).toStrictEqual('secret')
			expect(storage.putState).toHaveBeenCalled()
		})
	})

	describe('verifyState', () => {
		it('accepts a state that it can get by looking up an id', async () => {
			await expect(verifyState('some_id', 'stored_state')).resolves.not.toThrow()
		})
		it('throws an error if the state does not match the stored state', async () => {
			await expect(verifyState('some_id', 'suspicious_state')).rejects.toThrow()
		})
	})
})
