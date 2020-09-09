const express = require('express')

const PORT = 3000

const app = express()

app.get('/testroute', async (req, res) => {
	res.status(200).end()
})

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
