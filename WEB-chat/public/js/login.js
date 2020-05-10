//解析url
var chatUrl = "http://chat.yunkong.work/chat";
//var socket = io();
$("#login").click(login);
//请求登陆
function login(){
	axios.get('/login', { //发送的参数
		params:{
			userName:$("#userName").val(),
		}
	})
	.then(function (response) { //成功的消息
			console.log(response);
			let {status,msg,url} = response.data;
			console.log(status,msg,url);
			$("#pic").attr("src",url);
			$("#msg").html(msg);
			if(status){
				//执行动画
				//socket.emit('coming',{"user":$("#userName").val()});
				$("#userName").val(""); 
				location.href ="/chat";
			}else{
				//执行动画
				$("#modal").css("animation","myfirst 1.5s 1");
				//清除样式
				setTimeout(function(){ 
					$("#modal").css("animation","")
				},1500);
				$("#userName").val("");
			}
	})
	.catch(function (error) { //失败的消息
			console.log(error);
	});
}

//回车监听
$("#userName").keydown(function(e){
	if(e.keyCode==13){
		$("#login").click();
	}
});