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
app.post('/result', (req,res) => {
    id+=1;
    console.log("GET POST")
    console.log(req.body);
    data.push({
        id: id,
        name: req.body.name,
        post: req.body.post,
        time: req.body.time,
        replies: []
    })
    console.log(data);
    res.json(data);
})

app.post('/api/reply', (req,res) => {
    console.log("GET REPLY");
    console.log(req.body);
    let postId = req.body.postId
    data[postId].replies.push({
        id: req.body.id,
        name: req.body.name,
        reply: req.body.reply,
        time: req.body.time
    })
    console.log(data[postId]);
    res.json(data[postId].replies);
})

const port = process.env.PORT || 3001;
app.listen(port, ()=>{console.log("listening...")});
