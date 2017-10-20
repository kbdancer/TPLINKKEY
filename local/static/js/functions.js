$(document).ready(function() {
	wifiVM.init();
	setInterval(function(){  wifiVM.getlist(); },5000)
});

var wifiVM = new Vue({
	el:'.main-list-box',
	data:{
		total:0,
		list:[],
		page:1,
		rows:30
	},
	methods:{
		init:function () {
			var _self = this;
			_self.getlist();
			setTimeout(function () {
                pagerManager.init(_self.total, _self.rows, 'wifilistpager', function () {
                    wifiVM.getlist();
                });
            },500)
        },
		getlist:function(){
			var _self = this,params = {"page":_self.page,"rows":_self.rows};

			$.post("/get_wifi", params, function(data) {
				_self.total = parseInt(data.total);
				_self.list = data.rows;
			},"json");
		}
	}
});




//分页统一管理器
pagerManager = {
	init:function(total,rows,pagerId,callback){
		var pageCount = Math.ceil(total/rows),pageDiv = $("#"+pagerId);
		pageDiv.css("display",(pageCount < 1 ? "none":"block"));
		pageDiv.html(
			'<button type="button" class="btn btn-sm btn-default pull-right" title="末页" onclick="pagerManager.goEnd(this,'+ callback +','+ pageCount +');"><span class="glyphicon glyphicon-fast-forward"></span></button>'+
			'<button type="button" class="btn btn-sm btn-default pull-right" title="下一页" onclick="pagerManager.pageDown(this,'+ callback +','+ pageCount +');"><span class="glyphicon glyphicon-forward"></span></button>&nbsp;'+
			'<button class="btn btn-sm btn-default pull-right go" onclick="pagerManager.goPage(this,'+ pageCount +','+ callback +');">GO</button>&nbsp;&nbsp;'+
			'<div class="input-group input-group-sm pull-right">'+
			  	'<input type="text" class="form-control" value="1" onblur="pagerManager.check(this);">'+
			  	'<span class="input-group-addon"> /'+ pageCount +' 页</span>'+
			'</div>&nbsp;&nbsp;'+
			'<button type="button" class="btn btn-sm btn-default pull-right" title="上一页" onclick="pagerManager.pageUp(this,'+ callback +');"><span class="glyphicon glyphicon-backward"></span></button>&nbsp;'+
			'<button type="button" class="btn btn-sm btn-default pull-right" title="首页" onclick="pagerManager.goStart(this,'+ callback +');"><span class="glyphicon glyphicon-fast-backward"></span></button>&nbsp;'
			);
	},
	goPage:function(obj,pageCount,callback){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(isNaN(getPage) || getPage>pageCount || getPage<1){ alert("请输入正确的页数");return false; }
		wifiVM.page = getPage;
		callback();
	},
	pageUp:function(obj,callback){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage > 1){
			object.parent().find('input').val((getPage - 1));
			wifiVM.page = getPage - 1;
			object.parent().find('button.go').click();
		}else{
			alert("已经是第一页");
		}
	},
	pageDown:function(obj,callback,pageCount){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage < pageCount){
			object.parent().find('input').val((getPage + 1));
			wifiVM.page = getPage + 1;
			object.parent().find('button.go').click();
		}else{
			alert("已经是最后一页");
		}
	},
	goStart:function(obj,callback,pageCount){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage == 1){ alert("已经是第一页");return false; }
		object.parent().find('input').val("1");
		wifiVM.page = 1;
		object.parent().find('button.go').click();
	},
	goEnd:function(obj,callback,pageCount){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage == pageCount){ alert("已经是最后一页");return false; }
		wifiVM.page = pageCount;
		object.parent().find('input').val(pageCount);
		object.parent().find('button.go').click();
	},
	check:function(obj){
		var object = $(obj),thisVal = parseInt(object.val());
		if(isNaN(thisVal)){ object.val("1"); }
	}
};
