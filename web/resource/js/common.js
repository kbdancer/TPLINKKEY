//正在加载
chainLoading = {   
	show: function() {      
		if($("#iamloading__box").attr("data-load") == undefined){
			$("body").append('<div id="iamloading__box" data-load="load">'+
								'<div id="iamloading__box_center"><img src="'+ base_url_path +'/resource/images/loading.gif"></div>'+
								'<style type="text/css">'+
									'#iamloading__box{position: fixed; z-index: 1000000; background:rgba(0,0,0,0.5); width: 100%; top: 0; left: 0;}'+
									'#iamloading__box_center{ width: 60px; height: 60px; line-height: 60px; border-radius: 5px;background: rgba(0,0,0,0.8); text-align: center;position:relative;}'+
								'</style>'+
							'</div>');
		}
		var boxObj = $("#iamloading__box"),centerObj = $("#iamloading__box_center");
		boxObj.height($(window).height());
		centerObj.css({"left":($(window).width()-60)/2+"px","top":($(window).height()-60)/2*.8+"px"});
		boxObj.css("display","block");
	},      
	hide: function() { $("#iamloading__box").fadeOut(400); }
};
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
		callback();
	},
	pageUp:function(obj,callback){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage > 1){
			object.parent().find('input').val((getPage - 1));
			object.parent().find('button.go').click();
		}else{
			alert("已经是第一页");
		}
	},
	pageDown:function(obj,callback,pageCount){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage < pageCount){
			object.parent().find('input').val((getPage + 1));
			object.parent().find('button.go').click();
		}else{
			alert("已经是最后一页");
		}
	},
	goStart:function(obj,callback){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage == 1){ alert("已经是第一页");return false; }
		object.parent().find('input').val("1");
		object.parent().find('button.go').click();
	},
	goEnd:function(obj,callback,pageCount){
		var object = $(obj),getPage = parseInt(object.parent().find('input').val());
		if(getPage == pageCount){ alert("已经是最后一页");return false; }
		object.parent().find('input').val(pageCount);
		object.parent().find('button.go').click();
	},
	check:function(obj){
		var object = $(obj),thisVal = parseInt(object.val());
		if(isNaN(thisVal)){ object.val("1"); }
	}
};
//图片处理器
imgcontro = {
	upload:function(obj,randcode,callBack){
		var object = $(obj),form = object.parent(),
			iframe = document.getElementById("tmp_"+ randcode),getResStr,w_timer,jsonData,filepath = object.val(),
			extStart = filepath.lastIndexOf("."),ext = filepath.substring(extStart,filepath.length).toUpperCase();

		form.attr({"target":"tmp_"+randcode,"action":"bin/u.php"}); 

		if(filepath == "" || filepath == null){
			gDialog.fAlert('<h4 class="alert_warn">请先选择一张图片</h4>',function(){  });
			return false;
		}
		if(ext!=".JPG"&&ext!=".JPEG"&&ext!=".GIF"&&ext!=".BMP"&&ext!=".PNG"){ 
			gDialog.fAlert('<h4 class="alert_warn">仅限于上传 jpeg，jpg，png，bmp，gif 格式的文件</h4>',function(){  });
	        return false;
	    }
	    chainLoading.show();
		form.submit();
		if (iframe.attachEvent) {
			iframe.attachEvent("onload", function() {
				getResStr = document.frames[iframe.id].document.body.innerHTML;
			});
			w_timer = setInterval(function(){
				if(getResStr != ""){
					clearInterval(w_timer);
					jsonData = JSON.parse(getResStr);
					callBack(jsonData);
				}
			},50);
		} else {
			iframe.onload = function() {
				getResStr = iframe.contentDocument.body.innerHTML;
				jsonData = JSON.parse(getResStr);
				callBack(jsonData);
			};
		}
	},
	error:function(obj,path){
		$(obj).attr("src",path);
	}
};
//模板加载器
tplloader = {
	load:function(tpl,callback){
		var controlPanel = $("#mainContainer"),tpl = tpl + "?r=" + Math.random();
		$.ajax({
			url: tpl,
			type: 'GET',
			dataType: 'HTML',
			async:false,
			data: {},
			success:function(data){ controlPanel.empty().html(data);callback(); }
		});
	}
};
//复选框处理器
checkbox = {
	clickAll:function(obj,aimId){
		var object = $(obj),
			checkboxItems = object.parents("table").find('input[data-type="checkbox_item"]'),
			itemsLen = checkboxItems.length,ids = new Array();

		for(var i = 0; i < itemsLen ;i++){
			checkboxItems.eq(i).get(0).checked = object.get(0).checked;
			if(object.get(0).checked){
				ids[i] = checkboxItems.eq(i).attr("data-id");
			}
		}
		$("#"+aimId).attr("data-ids",ids.join(","));
	},
	clickItem:function(obj,aimId){
		var object = $(obj),checkboxAll = object.parents("table").find('input[data-type="checkbox_all"]'),
			checkboxItems = object.parents("table").find('input[data-type="checkbox_item"]'),
			itemsLen = checkboxItems.length,ids = new Array();

		for(var i = 0,j = 0; i < itemsLen ; i++){
			if(checkboxItems.eq(i).get(0).checked){
				ids[j] = checkboxItems.eq(i).attr("data-id");
				j++;
			}
		}

		checkboxAll.get(0).checked = ids.length == itemsLen ? true : false;
		$("#"+aimId).attr("data-ids",ids.join(","));
	}	
}
//错误代码检查
checkCode = {
	c:function(code){
		var csta = true,e;
		if(code == 99){ 
			gDialog.fAlert('会话已过期，请重新登录',function(){ window.location.href = "../login"; });
			csta = false;
		}else{
			switch(code){
				case 0:csta = true;break;
				case 11:csta = false; e = "用户名已存在";break;
				case 12:csta = false; e = "商家已存在";break;
				case 13:csta = false; e = "文件不存在";break;
				case 14:csta = false; e = "上传文件太大";break;
				case 15:csta = false; e = "上传文件格式不对";break;
				case 20:csta = false; e = "当前用户不允许删除";break;
				case 88:csta = false; e = "数据库连接失败，请联系管理员";break;
				case 99:csta = false; alert('用户未登录，请先登录');window.location.href = "index.html";break;
				default:csta = false; e = "出现了未知的错误：code["+ code +"]";break;
			}
			if(!csta){ gDialog.fAlert('<h4 class="alert_warn">'+e+'</h4>',function(){}); }
		}
		return csta;
	}
};
//通用下拉菜单选择控制
dropdownct = {
	c:function(obj){
		var object = $(obj),id = object.attr("data-id"),text = object.text(),
			boxObj = object.parents(".btn-group").attr("data-id") == undefined ? object.parents(".dropdown"):object.parents(".btn-group");
		
		boxObj.attr("data-id",id).attr("data-text",text);
		boxObj.find('button.dropdown-toggle').html(text +' <span class="caret"></span>');
	},
	p:function(obj){
		var object = $(obj),level = parseInt(object.attr("data-level")),id = object.attr("data-id"),text = object.text(),
			boxObj = object.parents(".btn-group").attr("data-id") == undefined ? object.parents(".dropdown"):object.parents(".btn-group");

		for(var i = (level - 1);i > 0;i--){
			id = id + "_" +boxObj.find("ul").eq(i).attr("data-param") + "#" + boxObj.find("ul").eq(i).prev().attr("data-id");
		}
		id = id + "_province";

		var filterArray = id.split("#"),tmp = "";

		for(var i = 0; i < filterArray.length ; i++){
			tmp = tmp +filterArray[i].split("_")[1]+':'+filterArray[i].split("_")[0]+',';
		}
		tmp = tmp.substring(0,tmp.length-1);

		boxObj.attr("data-id",tmp).attr("data-text",text);
		boxObj.find('button.dropdown-toggle').html(text +' <span class="caret"></span>');
	}
};
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) { return config.raw ? s : encodeURIComponent(s); }
	function decode(s) { return config.raw ? s : decodeURIComponent(s); }
	function stringifyCookieValue(value) { return encode(config.json ? JSON.stringify(value) : String(value)); }
	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};
}));


