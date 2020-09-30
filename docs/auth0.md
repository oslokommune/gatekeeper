# Configuring Auth0 for Gatekeeper

## TL;DR:
1. Create a "Regular Web Application"
2. Add the url of your gatekeeper to "Allowed Callback URLs" and the urls of your frontends to "Allowed Origins (CORS)"
3. Fetch "Client ID", "Client Secret" and "OpenID Configuration URL" from the Settings tab

## Create and configure the right type of application
1. After creating an account and logging in, navigate to the [Dashboard](https://manage.auth0.com/dashboard/) and click "Create Application" in the top right corner of the screen.
2. Enter a name, choose "Regular Web Applications" and click "Create".
3. In the "Settings" tab, scroll down to Allowed Callback URLs and enter https://<your gatekeeper url>/callback
4. In the "Settings" tab, scroll down to "Allowed Origins (CORS)". Enter the URLs of all the frontends that are going to use the Gatekeeper. https://yourapp.url and maybe http://localhost:8080 for developing.

## Fetch the needed information
Gatekeeper needs the following information from your authentication provider:
- client credentials (ID and secret)
- discovery URL

### Getting the client credentials
1. Navigate to the [Dashboard](https://manage.auth0.com/dashboard/) and select "Applications" in the menu on the left side of the screen.
2. Click on the name of the application you created earlier
3. In the "Settings" tab, there should be two input fields close to the top of the page, one being "Client ID" and the other "Client Secret". These are your CLIENT_ID and CLIENT_SECRET.

### Getting the discovery URL
1. Navigate to the [Dashboard](https://manage.auth0.com/dashboard/) and select "Applications" in the menu on the left side of the screen.
2. Click on the name of the application you created earlier
3. In the "Settings" tab, scroll all the way down to the bottom and click "Show Advanced Settings".
4. Switch to the "Endpoints" tab. One of the input fields is called "OpenID Configuration URL". This is your DISCOVERY_URL.
