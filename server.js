const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());

// app.get('/:id', function(req, res) {
//     //console.log(req.header);
//     // req.body
//     //console.log(req.query);
//     console.log(req.params)
//     res.status(404).send('Not found')
// });

// app.get('/profile', (req, res) => {
//     res.send('getting profile...');
// });

// app.post('/profile', (req, res) => {
//     console.log(req.body)
//     const user = {
//         name: 'Sally',
//         hobby: 'Coding'
//     }
//     res.send(user);
// });

app.use(express.static(__dirname + '/public'));

app.listen(3000);
