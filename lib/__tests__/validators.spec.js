const nanoid = require('nanoid')
const { URL } = require('url')

const {
	verifyLegalNanoid,
	verifyLegalCode,
	verifyLegalRedirectURL,
	verifyLegalJWTToken
} = require('../validators')

describe('Validators', () => {
	describe('Nanoid validator', () => {
		it('accepts a correctly formed nanoid', () => {
			const ids = [nanoid(), nanoid(), nanoid()]

			ids.forEach(id => {
				expect(() => {
					verifyLegalNanoid(id)
				}).not.toThrow()
			})
		})

		it('throws an error if incorrect length', () => {
			const id = '77KCD2Vonnf8_a-pVkYYP'

			expect(() => {
				verifyLegalNanoid(id + 'a')
			}).toThrow()
			expect(() => {
				verifyLegalNanoid(id.slice(0, -1))
			}).toThrow()
		})

		it('throws an error when containing fishy characters', () => {
			const ids = [
				'77KCD2Vonnf8_a-pV}YYP',
				'77KCD2{onnf8_a-pVkYYP',
				'77KCD2Von;f8_a-pVkYYP',
				'77KCD2Vonnf8_a-pV<YYP',
				'77KCD2Vonnf8_a-pVkY>P',
				'77KCD2VonЉnf8_a-pVkYYP'
			]

			ids.forEach(id => {
				expect(() => {
					verifyLegalNanoid(id)
				}).toThrow()
			})
		})
	})

	describe('Code challenge validator', () => {
		it('accepts a correctly formed code', () => {
			const codes = [
				'0bbc0759-3f52-44ba-bcbe-a1b214cda3e4.ff0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d',
				'069f8105-52d7-456e-b671-3eecb0f4f195.ff0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d',
				'be83dfcb-422c-4b4a-96ef-9a630266bb1d.ff0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d'
			]

			codes.forEach(code => {
				expect(() => {
					verifyLegalCode(code)
				}).not.toThrow()
			})
		})

		it('throws an error if incorrect length', () => {
			const code = '069f8105-52d7-456e-b671-3eecb0f4f195.ff0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d'

			expect(() => {
				verifyLegalCode(code + 'a')
			}).toThrow()
			expect(() => {
				verifyLegalCode(code.slice(0, -1))
			}).toThrow()
		})

		it('throws an error when containing fishy characters', () => {
			const codes = [
				'0{9f8105-52d7-456e-b671-3eecb0f4f195.ff0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d',
				'069f8}05-52d7-456e-b671-3eecb0f4f195.ff0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d',
				'069f8105-52d7-456e-b671-3eecb0f4f195.f;0127c5-5723-4e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d',
				'069f8105-52d7-456e-b671-3eecb0f4f195.ff0127c5-5723-@e47-87a2-d133437eaa7b.5211ab42-0160-42cf-b763-2f0224a6bc5d',
				'069f8105-52d7-456e-b671-3eecb0f4f195.ff0127c5-5723-4e47-87a2-d133437eaa7_.5211ab42-0160-42cf-b763-2f0224a6bc5d'
			]

			codes.forEach(code => {
				expect(() => {
					verifyLegalCode(code)
				}).toThrow()
			})
		})
	})

	describe('url whitelist validator', () => {
		it('accepts a whitelisted hostname', () => {
			const hostname = 'http://awesome.com'

			const rules = {
				ORIGIN: hostname,
				PATHNAME_VALIDATOR: /\//
			}

			expect(() => {
					verifyLegalRedirectURL(rules, hostname)
			}).not.toThrow()
		})

		it('throws an error on hostnames that are not whitelisted', () => {
			const url = 'http://rogue.url'

			const rules = {
				ORIGIN: 'http://protected.url',
				PATHNAME_VALIDATOR: /\//
			}

			expect(() => {
				verifyLegalRedirectURL(rules, url)
			}).toThrow()
		})

		it('accepts a whitelisted path and only the whitelisted path', () => {
			const url_with_good_path = new URL('http://protected.url/fancy/path')
			const url_with_bad_path = new URL('http://protected.url/lessfancy/path')

			const rules = {
				ORIGIN: url_with_good_path.origin,
				PATHNAME_VALIDATOR: /^\/fancy\/path$/
			}

			expect(() => {
				verifyLegalRedirectURL(rules, url_with_good_path)
			}).not.toThrow()
			expect(() => {
				verifyLegalRedirectURL(rules, url_with_bad_path)
			}).toThrow()
		})
	})

	describe('JWT validator', () => {
		it('accepts a correctly formated JWT token', () => {
			const tokens = [
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
				'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
				'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
				'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.' +
				'eyJzdWIiOiIxMjMyMTMxMjMyMyIsIm5hbWUiOiJTdXBlcm1hbiIsImlhdCI6MTMyMTMyMTMxfQ.' +
				'QbyjRaoaZpD0eXJigmMCkEPeOW5d-dbDKI5f7v_2YW6hccvsywTY3e2rbtb19FxrD_oQcyhIKq71InSG_DpABw',
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
				'eyJzdWIiOiIyMzEyMzE0MjE0MiIsIm5hbWUiOiJCZW4gRG92ZXIiLCJpYXQiOjM4MjEzMTI0fQ.' +
				'MQym9-iIhIyq3ZmviPiScockS4i7dMHvWvlZbuDX-RU',
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpY' +
				'XQiOjE1NzUzNjY2MzksImV4cCI6MTYwNjkwMjYzOSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3V' +
				'iIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb' +
				'2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9' +
				'qZWN0IEFkbWluaXN0cmF0b3IiXX0.jJoo0esqreFPlPcslbtjE5WAta56OUoY_ggIlrBsHT0',
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJNYWdpYyBidWlsZGVyIiwiaWF0IjoxNTc1M' +
				'zY2NzYzLCJleHAiOjE2MDY5MDI3NjAsImF1ZCI6ImhhY2tlcmNvbW11bml0eS5jb20iLCJzdWIiOiJtaW5' +
				'icnVrZXJAdGVzdC5ubyIsIkdpdmVuTmFtZSI6IkJlbiIsIlN1cm5hbWUiOiJGaXNoZXIiLCJFbWFpbCI6I' +
				'm5vd2VhcG9uQHBhY2lmaXN0LmNvbSIsIlJvbGUiOlsiR29kIiwiRGV2ZWxvcGVyIl19.LD8SqhgkoF0o6G' +
				'_cZwQyEoW5NS22ANhs9QRVGkgJII8'
			]

			tokens.forEach(token => {
				expect(() => {
					verifyLegalJWTToken(token)
				}).not.toThrow()
			})
		})

		it('throws an error when consisting of less than 3 parts', () => {
			const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'

			expect(() => {
				verifyLegalJWTToken(token)
			}).toThrow()
		})

		it('throws an error when containing fishy characters', () => {
			const tokens = [
				'eyJhbGciOiJIUzI;NiIsInR5cCI6IkpXVCJ9.' + // ;
				'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
				'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
				'eyJhbGciOiJIUzU{MiIsInR5cCI6IkpXVCJ9.' + // {
				'eyJzdWIiOiIxMjMyMTMxMjMyMyIsIm5hbWUiOiJTdXBlcm1hbiIsImlhdCI6MTMyMTMyMTMxfQ.' +
				'QbyjRaoaZpD0eXJigmMCkEPeOW5d-dbDKI5f7v_2YW6hccvsywTY3e2rbtb19FxrD_oQcyhIKq71InSG_DpABw',
				'eyJhbGciOiJIUzI}NiIsInR5cCI6IkpXVCJ9.' + // }
				'eyJzdWIiOiIyMzEyMzE0MjE0MiIsIm5hbWUiOiJCZW4gRG92ZXIiLCJpYXQiOjM4MjEzMTI0fQ.' +
				'MQym9-iIhIyq3ZmviPiScockS4i7dMHvWvlZbuDX-RU',
				'eyJ0eXAiOiJKV1Qi>LCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpY' + // >
				'XQiOjE1NzUzNjY2MzksImV4cCI6MTYwNjkwMjYzOSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3V' +
				'iIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb' +
				'2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9' +
				'qZWN0IEFkbWluaXN0cmF0b3IiXX0.jJoo0esqreFPlPcslbtjE5WAta56OUoY_ggIlrBsHT0',
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJNYWdpYyBidWlsZGVyIiwiaWF0IjoxNTc1M' + // <
				'zY2NzYzLCJleHAiOjE2MDY5MDI3NjAsImF1ZCI6ImhhY2tlcmNvbW11bml0eS5jb20iLCJzdWIiOiJtaW5' +
				'icnVrZXJAdGVzdC5ubyIsIkdpdmVu<TmFtZSI6IkJlbiIsIlN1cm5hbWUiOiJGaXNoZXIiLCJFbWFpbCI6I' +
				'm5vd2VhcG9uQHBhY2lmaXN0LmNvbSIsIlJvbGUiOlsiR29kIiwiRGV2ZWxvcGVyIl19.LD8SqhgkoF0o6G' +
				'_cZwQyEoW5NS22ANhs9QRVGkgJII8'
			]

			tokens.forEach(token => {
				expect(() => {
					verifyLegalJWTToken(token)
				}).toThrow()
			})
		})
	})
})

