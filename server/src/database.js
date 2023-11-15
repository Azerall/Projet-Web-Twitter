const {MongoClient} = require('mongodb');

async function main() {
  const uri = "mongodb://localhost/twister";
  const client = new MongoClient(uri);
	 
  try {
    // Connexion au serveur
    await client.connect();
    return client.db();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

main().catch(console.error);

module.exports = { main };