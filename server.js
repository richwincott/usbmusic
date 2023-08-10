const express = require('express')
const app = express()
const port = 3100;
const cors = require('cors')
const yt = require('youtube-search-without-api-key');
const { query } = require('express');

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.get('/youtubeSearch', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ message: 'Query value not provided' })
  const videos = await yt.search(query);
  res.json(videos)
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})