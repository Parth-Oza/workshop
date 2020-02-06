var express = require("express");
var app = express();
var fs = require("fs");
app.use(express.static("root"));

let data = fs.readFileSync("./posts.json");
let json = JSON.parse(data)
console.log(json);

app.use(express.json());
app.get("/post",(req,res)=>{
	res.send(json);

})

app.post("/post",(req,res)=>{
	//res.send(req.body);
	json.push(req.body);
    // res.send(json);
     // json.push({"title":"hrushi","desc":"mane"});
	 fs.writeFileSync("./posts.json", JSON.stringify(json,null,2))
	 res.send(json);
})
app.listen(3000,()=>{console.log("listening on port 3000")});

