function stripSpacesAndQuotes(string) {
	return string
		.replace(/\s/g, '')
		.replace(/"/g, '')
}

function ensureList(obj, deliminator = ';') {
	if (!obj) return []
	if (obj instanceof Array) return obj
	if (obj.indexOf(deliminator) === -1) return [obj]

	return obj.split(deliminator)
}

function ensureStrippedList(obj, deliminator=';') {
	if (!(obj instanceof String)) return ensureList(obj, deliminator)

	return ensureList(stripSpacesAndQuotes(obj), deliminator)
}

module.exports = {
	ensureList,
	ensureStrippedList,
	stripSpacesAndQuotes
}
