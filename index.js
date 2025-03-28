const express = require('express');
const cors = require('cors'); // ✅ Add CORS support
const basicAuth = require('basic-auth');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const port = process.env.PORT || 8080;

// ✅ CORS Configuration - restrict to your frontend domain
app.use(cors({
  origin: [
    'https://calm-moss-05452e50f.6.azurestaticapps.net',
    'https://calm-moss-05452e50f-preview.eastus2.6.azurestaticapps.net'
  ],
  credentials: true
}));


// Basic Auth credentials
const USERNAME = 'James';
const PASSWORD = 'Prima@2025';

// Cosmos DB configuration
const COSMOS_ENDPOINT = 'https://prima.documents.azure.com:443/';
const COSMOS_KEY = '0AHxmhTQMj7fvEBdSy4s0m7AOs4v7q10cnRVAZP1QS0hHpEtpxa7IMaCuW7KFWyBZFr7wjfIVhyvACDbs4eznA==';
const DATABASE_ID = 'prima-data';
const CONTAINER_ID = 'prescriptions';

const cosmosClient = new CosmosClient({
  endpoint: COSMOS_ENDPOINT,
  key: COSMOS_KEY,
});
const container = cosmosClient.database(DATABASE_ID).container(CONTAINER_ID);

// Middleware
app.use(express.json());

// Basic Auth Middleware
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="401"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Webhook status endpoint
app.get('/webhook', (req, res) => {
  res.send('✅ Webhook is live and ready to receive POST payloads.');
});

// POST /webhook - Receive data from vendor
app.post('/webhook', auth, async (req, res) => {
  const payload = req.body;
  try {
    await container.items.create(payload);
    console.log('✅ Stored payload with RxNo:', payload.RxNo);
    res.status(200).send('Payload received and stored.');
  } catch (error) {
    console.error('❌ Error saving to Cosmos DB:', error.message);
    res.status(500).send('Failed to store payload.');
  }
});

// GET /lookup - Query by lastName and DOB
app.get('/lookup', async (req, res) => {
  const { lastName, dob } = req.query;

  if (!lastName || !dob) {
    return res.status(400).json({ error: 'Missing required parameters: lastName and dob' });
  }

  const querySpec = {
    query: `SELECT * FROM c WHERE c.Patient.LastName = @lastName AND c.Patient.DOB = @dob`,
    parameters: [
      { name: '@lastName', value: lastName.toUpperCase() }, // Match format used in DB
      { name: '@dob', value: dob }
    ]
  };

  try {
    const { resources } = await container.items
      .query(querySpec, { enableCrossPartitionQuery: true })
      .fetchAll();

    if (resources.length === 0) {
      return res.status(404).json({ message: 'No matching record found.' });
    }

    // ✅ Return the full record
    return res.json(resources[0]);

  } catch (error) {
    console.error('❌ Lookup error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Webhook and lookup server running on port ${port}`);
});
