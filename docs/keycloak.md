# Configuring Keycloak for Gatekeeper

## Prerequisites
- You need access to a Keycloak instance and to configure a realm.

## TL;DR:
- Create a client and set its "Access Type" to "Confidential". The name of the client is the CLIENT_ID and the CLIENT_SECRET is in the credentials tab of the client.
- Configure the client with your <gatekeeper url>/callback as "Valid Redirect URIs" and your frontend URL as "Web Origins"
- The DISCOVERY_URL is the endpoint "OpenID Endpoint Configuration" found on the "Realm Settings" page. (Right click and copy link)

### Create and configure the Client

#### Create the client
1. Log in to Keycloak and select your realm.
2. Select "Clients" in the menu on the left and click "Create" in the top right corner of the screen.
3. Enter a client ID. Note this down, this is the CLIENT_ID. Ensure the Client Protocol is "OpenID Connect".
4. Click "Save"?.

#### Configure the client
1. Log in to Keycloak and select your realm.
2. Select "Clients" in the menu on the left and select your client.
3. In the "Settings" tab, set "Access Type" to "Confidential".
4. In the "Settings" tab, enter https://<your gatekeeper url>/callback in "Valid Redirect URIs".
5. In the "Settings" tab, enter the URLs of your frontend(s) in "Web Origins". E.g: https://yourapp.url, http://localhost:8080
6. Click "Save" on the bottom of the page.


## Fetch the needed information
Gatekeeper needs the following information from your authentication provider:
- client credentials (ID and secret)
- discovery URL

#### Getting the client credentials
1. Log in to Keycloak and select your realm.
2. Select "Clients" in the menu on the left and select your client.
3. In the "Settings" tab, close to the top of the page there should be an input field called "Client ID". This is your CLIENT_ID
4. In the "Credentials" tab, there should be an input field called "Secret". This is your CLIENT_SECRET

#### Getting the discovery URL
1. Log in to Keycloak and select your realm.
2. Select "Realm Settings".
3. Find the "Endpoints" field, right click and copy the URL of "OpenID Endpoint Configuration". This is your DISCOVERY_URL
