const dns = require('dns');
// Set DNS to Google DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const uri = 'mongodb+srv://dikshajain16141_db_user:YOUR_PASSWORD@cluster0.1qkobkr.mongodb.net/vaccine_db?retryWrites=true&w=majority&appName=Cluster0';

// Note: Replace YOUR_PASSWORD with the user's password if we run it, but let's test DNS resolution first.
dns.resolveSrv('_mongodb._tcp.cluster0.1qkobkr.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV Resolution Failed:', err);
  } else {
    console.log('DNS SRV Resolution Succeeded:', addresses);
  }
});
