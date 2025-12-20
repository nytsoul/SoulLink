const mongoose = require('mongoose');
const uri = process.argv[2];
mongoose.connect(uri, { connectTimeoutMS: 10000 })
  .then(()=> { console.log('Connected OK'); process.exit(0) })
  .catch(err => { console.error('Connection error:', err); process.exit(1) });