const express = require('express')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('WORKING')
})

app.listen(3006, () => {
    console.log('listentning at 3006')
})