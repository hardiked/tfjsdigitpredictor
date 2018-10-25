let express = require('express');
let app = express();

app.use(express.static("../client"));

app.listen(8080, function(){
    console.log("Server running on port 8080");
});