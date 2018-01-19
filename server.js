const express = require('express');
const bodyparser = require('body-parser');

const app = express();

//structure:
//data:
// [0] [ { id: 0,
// [0]     name: 'Bryan',
// [0]     post: 'first post',
// [0]     time: '2017/4/8 14:58:54',
// [0]     replies: [] },
// [0]   { id: 1,
// [0]     name: 'a',
// [0]     post: 'd',
// [0]     time: '2017/4/8 14:59:01',
// [0]     replies: [ {
//             id: 1-0,
//             name: Andrea,
//             reply: 'first comment',
//             time: '2017/5/8 22:20:32'
//         } ] } ]

const data = [{
    id: 0,
    name: 'Bryan',
    post: 'first post\nsecond line',
    time: '2017/5/8 20:58:24',
    replies: [ { 
        id: 0-0,
        name: 'Andrea',
        reply: 'first comment',
        time: '2017/5/8 22:20:32'
    }]
}];
var id = 0;
console.log(__dirname)
app.use(bodyparser.json());
app.use(express.static(__dirname+'/build'))
app.use(express.static(__dirname+'/public'))
app.get('/', (req,res)=>{res.sendFile(__dirname+'/public/index.html')})
app.get('/data', (req, res)=>{res.json(data)})
app.post('/result/lr', (req,res) => {
    console.log("GET LOGISTIC REGRESSION RESULT")
    // console.log(req.body);
})

app.post('/result/rf', (req,res) => {
    console.log("GET RANDOM FOREST RESULT");
    console.log(req);
})

const port = process.env.PORT || 3001;
app.listen(port, ()=>{console.log("listening...")});
