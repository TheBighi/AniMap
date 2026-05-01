const healthCheck = (req, res) => {
    res.status(200).send('ok')
}

module.exports = { healthCheck }