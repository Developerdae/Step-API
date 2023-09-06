const express = require('express')
const { google } = require('googleapis')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 3000

// Configure Google Fit API credentials
const credentials = require('./Auth.json')
const { client_secret, client_id, redirect_uris } = credentials.web
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
)

// Define API endpoints
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/fitness.activity.read']
  })
  // Redirect the user to the Google authentication page
  res.redirect(authUrl)
})

app.get('/callback', async (req, res) => {
  const code = req.query.code
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)

  // Redirect the user to the /steps endpoint with the access token as a query parameter
  res.redirect(`/steps?access_token=${tokens.access_token}`)
})

app.get('/steps', async (req, res) => {
  try {
    const accessToken = req.query.access_token
    // The provided access token is used for authentication
    oAuth2Client.setCredentials({ access_token: accessToken })

    // Make an API request to Google Fit API to retrieve steps data
    // Use oAuth2Client for authorization
    const fitness = google.fitness('v1')
    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 }, // 24 hours
        startTimeMillis: Date.now() - 24 * 60 * 60 * 1000, // calculation equivalent to 1 day
        endTimeMillis: Date.now()
      },
      auth: oAuth2Client
    })

    // Extract the steps data from the response
    const stepsData =
      response.data.bucket[0].dataset[0].point[0].value[0].intVal

    // Send the steps data as a JSON response
    res.json({ steps: stepsData })
    res.redirect(`127.0.0.1:5500?access_token=${tokens.access_token}`)
  } catch (error) {
    console.error('Error retrieving steps data:', error.message)
    res.status(500).json({ error: 'Sorry, no steps data available' })
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
