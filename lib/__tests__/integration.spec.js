require('dotenv').config()
/*
 * Requires following environment variables to be set
 * - BASE_URL for the test Gatekeeper
 * - DISCOVERY_URL for the authentication broker the test Gatekeeper integrates against
 * - SUCCESSFUL_LOGIN_ORIGIN
 * - TEST_USERNAME username of a user existing in the authentication broker
 * - TEST_PASSWORD password associated with the TEST_USERNAME user
 */

const Axios = require('axios')
const queryString = require('query-string')

const axios = Axios.create({
	validateStatus(status) {
		// Prevent axios from throwing an error on 302 since we're not letting it automatically follow
		// redirects. // default is status >= 200 && status < 300
		return status >= 200 && status <= 302
	}
})

function getCookieFromHeaders(headers, key) {
	const cookies = headers['set-cookie']

	for (let index = 0; index < cookies.length; index++) {
		const parts = cookies[index].split(';')[0].split('=')
		const current_cookie_key = parts[0]
		const value = parts[1]

		if (current_cookie_key === key) return value
	}

	return null
}

async function initiateLoginFlow(gatekeeper_url, redirect_url) {
	/*
	 * Starts the authentication flow by calling the Gatekeepers /login entrypoint
	 * The Gatekeeper should return a 302 response with a state_id cookie set and
	 * the required OAuth2 authentication flow parameters as query parameters in
	 * the redirect location header
	 */
	const { headers } = await axios.request({
		url: `${gatekeeper_url}/login?redirect=${redirect_url}`,
		method: 'GET',
		maxRedirects: 0
	})

	return {
		url: headers['location'],
		state_id: getCookieFromHeaders(headers, 'state_id')
	}
}

async function scrapeKeycloakLoginForm(keycloak_login_url) {
	/*
	 * Scrapes the Keycloak login screen for the form action URL. This URL together with
	 * the following query parameters and some cookies will be used submit the login form
	 */
	const { data: html, headers } = await axios.get(keycloak_login_url)

	// Extract submit action= url from form
	const match = /action="(?<url>.+)"\s/.exec(html)

	return {
		action_url: match.groups.url.replace(/amp;/g, ''),
		cookies: {
			'AUTH_SESSION_ID': getCookieFromHeaders(headers, 'AUTH_SESSION_ID'),
			'KC_RESTART': getCookieFromHeaders(headers, 'KC_RESTART')
		}
	}
}


async function submitKeycloakLoginForm(action_url, cookies, credentials) {
	/*
	 * Programmatically submits the Keycloak login form with the
	 * given credentials and cookies, returning the next location in the
	 * redirect chain
	 */
	const formData = new FormData()
	formData.set('username', credentials.username)
	formData.set('password', credentials.password)

	const { headers } = await axios.request({
		url: action_url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'origin': 'http://localhost:3333',
			Cookie: queryString.stringify(cookies).replace(/&/g, '; ')
		},
		data: new URLSearchParams(formData).toString(),
		maxRedirects: 0
	})

	return {
		callback_url: headers['location']
	}
}

async function followCallbackUrl(callback_url, cookies) {
	const { headers } = await axios.request({
		url: callback_url,
		method: 'GET',
		headers: {
			Cookie: queryString.stringify(cookies).replace(/&/g, '; '),
			origin: 'http://localhost:3333'
		},
		maxRedirects: 0
	})

	return {
		access_token: getCookieFromHeaders(headers, 'access_token'),
		refresh_token: getCookieFromHeaders(headers, 'refresh_token')
	}
}

async function fetchUserinfo(userinfo_endpoint, access_token) {
	const { data } = await axios.request({
		url: userinfo_endpoint,
		method: 'GET',
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	})

	return { preferred_username: data.preferred_username }
}

/*
 * Before this can work, we need to be able to spawn an instance of the Gatekeeper in our test environment from
 * Github actions. This will take time. Disabling it for now.
 */
describe('integration', () => {
	it('logs in and tests the received access_token against the userinfo endpoint', async () => {
		const redirect_url = process.env.ORIGIN_WHITELIST
		console.log('InitiateLoginFlow')
		const { url: kc_login_url, state_id } = await initiateLoginFlow(process.env.BASE_URL, redirect_url)

		console.log('scrapeKeycloakLoginForm')
		const { action_url, cookies } = await scrapeKeycloakLoginForm(kc_login_url)

		console.log('SubmitKeycloakLoginForm')
		const credentials = { username: process.env.TEST_USERNAME, password: process.env.TEST_PASSWORD }
		const { callback_url } = await submitKeycloakLoginForm(action_url, cookies, credentials)

		console.log('FollowCallbackUrl')
		const { access_token } = await followCallbackUrl(callback_url, { state_id })

		console.log('FetchUserinfo')
		const { data: oidc_config } = await axios.get(process.env.DISCOVERY_URL)
		const { preferred_username } = await fetchUserinfo(oidc_config.userinfo_endpoint, access_token)

		expect(preferred_username).toStrictEqual(credentials.username)
	})
})
