const express = require('express')
const app = express()
const port = 3100;
const cors = require('cors')
const yt = require('youtube-search-without-api-key');
const axios = require('axios');
const https = require('https')

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.get('/youtubeSearch', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ message: 'Please provide the querystring value: query' })
  const videos = await yt.search(query);
  res.json(videos)
})

app.get('/youtubeMeta', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ message: 'Please provide the querystring value: url' })
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  try {
    const data = await axios.get('https://dev.richardwincott.co.uk/youtubemetadata?url=' + url, { httpsAgent: agent })
    res.json(data)
  }
  catch (err) {
    res.json({ message: err.message })
  }
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})