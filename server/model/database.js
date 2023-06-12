const mongoose = require('mongoose');


// mongoose.connect("mongodb://localhost:27017/kokthum", {
//    useNewUrlParser: true,
//    useUnifiedTopology: true
// });





 mongoose.connect('mongodb+srv://berean:bereanMark@kokthumnews.fdgowiq.mongodb.net/kokthumall?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected')
});

// Models
require('./allnews');