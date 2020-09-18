const config = {
	listening_port: process.env.PORT || 4554
}

if (process.env.CERTIFICATE_FILE || process.env.KEY_FILE) {
	if (!process.env.CERTIFICATE_FILE || !process.env.KEY_FILE)
		throw new Error('SSL requires both a certificate and a key')

	config.ssl = {
		certificate_file: process.env.CERTIFICATE_FILE,
		key_file: process.env.KEY_FILE
	}
}

module.exports = config
