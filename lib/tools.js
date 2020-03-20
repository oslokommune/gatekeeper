function ensureList(obj, deliminator = ';') {
	if (!obj) return []
	if (obj instanceof Array) return obj
	if (obj.indexOf(deliminator) === -1) return [obj]

	return obj.split(deliminator)
}

module.exports = {
	ensureList
}
