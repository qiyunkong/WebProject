//建立连接
var socket = io({
	query:{
		nickname:$("#user").html()
	}
});
var bulletKey = true;
var infoKey = false;
var memberKey = false;

($('.chatBox-ul').children("li:last-child")[0]).scrollIntoView();
//发送内容事件
$("#btnSend").click(function(){
	socket.emit("news",{
		"content":$("#textarea").val(),
		"user":$("#user").html(),
		"url":$("#userPic").attr("src"),
	});
	$("#textarea").val("");
});

//回车监听
$("#textarea").keydown(function(e){
	if(e.keyCode==13){
		$("#btnSend").click();
	}
});

//消息监听
socket.on("news",function(msg){
	console.log(msg);
	let html = `<li  class=${msg.user==$("#user").html()?"chatRoom-me":""}>
					<div class="chatRoom-user">
						<img src="${msg.url}">
						<cite><i>${msg.time}</i>${msg.user}</cite>
					</div>
					<div class="chatRoom-user-text">${msg.content}</div>
				</li>`;
	$(".chatBox-ul").append(html);
	($('.chatBox-ul').children("li:last-child")[0]).scrollIntoView();
	bodybullet(msg.url,msg.user,msg.content);
});

//上线监听
socket.on("coming",function(msg){
	if($("#user").html()== msg.userName) return;
	let addUser =  `<li data_name=${msg.userName}>
		<div>
			<img src=${msg.url}>
			<span>${msg.userName}</span>
		</div>
	</li>`;
	let html =  `<li class="chatRoom-notice">${msg.userName} 加入聊天室</li>`;
	$(".chatBox-ul").append(html); //添加消息
	$("#chatList").append(addUser); //添加用户
	let num = $("#num").html();
	$("#num").html(+num + 1);
	($('.chatBox-ul').children("li:last-child")[0]).scrollIntoView();
})

//关闭事件
let userClose = $("#user").html();
window.onbeforeunload = function()  { ////author: meizz
	var n = window.event.screenX - window.screenLeft;
	var b = n > document.documentElement.scrollWidth-20;
	socket.emit("out",{
			"user":userClose,
	});
	if(b && window.event.clientY < 0 || window.event.altKey){
		//下线触发
	}else{}
}

//下线监听
socket.on("outUser",function(msg){
	//删除用户
	$("#chatList li").each(function(){
		if($(this).attr("data_name")==msg.nickname){
			$(this).remove();
		}
	});
	let html =  `<li class="chatRoom-notice">${msg.nickname} 离开聊天室</li>`;
	$(".chatBox-ul").append(html); //添加消息
	let num = $("#num").html();
	$("#num").html(+num - 1);
	($('.chatBox-ul').children("li:last-child")[0]).scrollIntoView();
});


//dom 操作
//弹幕操作
$("#bullet-open").click(bullet)
function bullet(){
	bulletKey = !bulletKey;
	if(bulletKey){ //开
		$("#bullet-open").removeClass("chat-bofangqi-danmuguan").addClass("chat-bofangqi-danmukai").attr("title","关闭弹幕");
		
	}else{ //关
		$("#bullet-open").removeClass("chat-bofangqi-danmukai").addClass("chat-bofangqi-danmuguan").attr("title","开启弹幕");
	}
}

//弹幕特性
function bodybullet(url,user,content){
	if(!bulletKey) return;
	//弹幕
	var item={
	img:url, //图片 
	info:user+":"+content, //文字 
	close:false, //显示关闭按钮 
	speed:8, //延迟,单位秒,默认8
	bottom:Math.round(Math.random()*(600-400)+400), //距离底部高度,单位px,默认随机  //Math.round(Math.random()*(y-x)+x) 500
	color:'#fff', //颜色,默认白色 
	old_ie_color:'#000000', //ie低版兼容色,不能与网页背景相同,默认黑色 
	}
	$('body').barrager(item);
}

//个人信息按钮
$("#infoSwitch").click(function(){
	infoKey?$(".chatBox-username").css("right","0"):$(".chatBox-username").css("right","-200px");
	infoKey = !infoKey;
})
//在线成员按钮
$("#memberSwitch").click(function(){
	memberKey?$(".chatBox-list").css("left","0"):$(".chatBox-list").css("left","-200px");
	memberKey = !memberKey;
})