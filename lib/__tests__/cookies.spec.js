describe('cookies', () => {
	describe('set', () => {
		const OLD_ENV = process.env

		beforeEach(() => {
			jest.resetModules()

			process.env = {
				...OLD_ENV,
				BASE_URL: 'http://mock.no',
				NODE_ENV: 'production'
			}
			this.cookies = require('../cookies') // must be imported after mocking the env vars

			delete process.env.NODE_ENV
		})

		afterEach(() => {
			process.env = OLD_ENV
		})

		it('enforces HttpOnly and Secure flag', () => {
			const response = { cookie: jest.fn() }

			this.cookies.setAccessToken(response, 'token')

			expect(response.cookie).toBeCalledWith(
				expect.anything(),
				expect.anything(),
				expect.objectContaining({
					httpOnly: true,
					secure: true
				})
			)
		})
	})
})
