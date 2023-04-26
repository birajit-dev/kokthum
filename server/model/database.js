const mongoose = require('mongoose');


mongoose.connect("mongodb://localhost:27017/neheraldnews", {
   useNewUrlParser: true,
   useUnifiedTopology: true
});


// mongoose.connect('mongodb+srv://birajit_dev:*67Birajit_dev@ne-surf.g7a62.mongodb.net/neSurf?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected')
});

// Models
require('./allnews');