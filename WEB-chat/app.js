//服务器端
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
//时间
const moment = require('moment');
moment.locale('zh-cn');

app.use(express.static('public'));
//公式
const http = require('http').Server(app);
const io = require('socket.io')(http);

//sessin 配置
var session = require('express-session');
app.use(session({
	secret:'keyboard cat', //值可以随意取便取
	resave:false,
	saveUninitialized:true,
	cookie:{
		maxAge:1000*60
	}
}))

app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");


//用户数组
var alluser = [];

//消息数组
var allContent = [];


//中间件
//显示首页
app.get("/",function(req,res){
	res.render("index");
})
//确认登陆,检查此人是否有用户名，并且名称不能重复
app.get("/login",function(req,res,next){
	var userName = req.query.userName;
	if(!userName){
		//console.log("必须填写用户名"+userName);
		res.send({
			status:0,
			msg:"必须填写用户名",
			url:"/image/error.png"
		});
		return;
	}
	//查找用户
	let data = alluser.find((index)=>{
		return index.userName == userName;
	})

	if(data){
		//console.log("用户名已经被占用了"+userName);
		res.send({
			status:0,
			msg:"用户名已经被占用了",
			url:"/image/error.png"
		});
		return;
	}
	
	//console.log("成功"+userName);
	alluser.push({
		userName,
		url:"/image/node.png",
	}); //向数组里添加用户名
	//付给session
	req.session.userName = userName;
	
	res.send({
		status:1,
		msg:"登陆成功",
		url:"/image/response.png"
	});
	
})

//聊天室
app.get("/chat",function(req,res,next){
	if(!req.session.userName){
		res.redirect("/");
		return;
	}
	let data = alluser.find((index)=>{
		return index.userName == req.session.userName;
	})
	if(!data){
		res.redirect("/");
		return;
	}
	res.render("chat",{
		"userName":req.session.userName,
		"url":data.url,
		alluser,
		allContent,
	});

})
//监听连接处理
io.on("connection",function(socket){
	//console.log(msg.user+"上线了");
	let nickname = socket.handshake.query.nickname;
	//console.log(nickname+"上线了");
	let data = alluser.find((index)=>{
		return index.userName == nickname;
	})
	//user = msg.user;
	io.emit("coming",data);

	//群发消息
	socket.on("news",function(msg){
		let data = {
			...msg,
			"time":moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
		}
		//console.log(data);
		io.emit("news",data);
		//历史记录
		allContent.push(data);
		//console.log(allContent);
	})
	
	
	//下线通知
	socket.on("disconnect",function(){
		//console.log(nickname+"有人下线");
		//console.log(alluser.length);
		for(var i = 0; i < alluser.length; i++){
		　　if(alluser[i].userName === nickname){
				alluser.splice(i,1);
		　　}
	　　}
		//console.log(alluser.length);
		if(!alluser.length){ //没有用户时清空历史记录
			allContent.length = 0;
		}
		
		io.emit("outUser",{nickname,});
		//disconnect
	})
	
})
//开启3000
http.listen(3001);
console.log("3001端口开启");
//https://www.bilibili.com/video/BV1hJ411d7DC?p=3  2.57