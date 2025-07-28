require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// urlshortener

app.use(bodyParser.urlencoded({ extended: false })); // parsing the URL-encoded data with the querystring library 

// In-memory storage for URL mappings
const urlDatabase = {};
let urlCounter = 1;

app.post('/api/shorturl', function(req, res) {
  const origin_url = req.body.url;
  if (!origin_url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  // Validate URL format
  try {
    const urlObj = new URL(origin_url);
    // DNS lookup to check if hostname is valid
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      // Store and return short URL
      const short_url = urlCounter++;
      urlDatabase[short_url] = origin_url;
      res.json({ original_url: origin_url, short_url });
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
});

// Redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const short_url = req.params.short_url;
  const original_url = urlDatabase[short_url];
  if (!original_url) {
    return res.status(404).json({ error: 'No URL found for the given short URL' });
  }
  res.redirect(original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
