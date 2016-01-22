/**
 util类
*/
(function($,w){
	w.gUtils = w.gUtils || {};
	var utils = w.gUtils;
 
	$.extend(utils,{
			 /** 渲染简单模板
			  * @param template 模板
			  * @param data 数据
			  * */
		 fRenderTemplate:function(template,data){
			var content='';
			if(data instanceof Array){
				for(var i=0;i<data.length;i++){
					content+=renderTemplate(template,data[i]);
				}
			}else{
				var t=template;
				for(var attr in data){
					var value=data[attr];
					if(value==null){
						value='';
					}
					t=t.replace(new RegExp("@{"+attr+"}","gm"),value);
				}
				content+=t;
			}
			return content;
		 },
		/**
		 *    弹出确认框 操作成功刷新列表，操作失败提示消息      
		 **/
		fConfirmAndRefreshList:function(config) {	
			gDialog.fConfirm(config.title, config.info, function() {
	            jQuery.ajax({
	    			url: config.url,
	    			type:'post',
	    			dataType: "json",
	    			data: config.param,
	    			success: function(data, ts) {
						gDialog.fClose();
						if(data['result']) {
								if(data['message']!=null & data['message']!=''){
									message_box.show(data['message'],'success');
								}
								queryList();			
						 }else{
							var sMessage=data['message'];
							if(sMessage==null){
								sMessage='处理异常，请联系管理员！';
							}
							bootbox.alert(sMessage);
						 }
					}
				});
			});
		},
		/**
		 * 
		 * @param param 表单参数
		 * @param validateSet 验证规则
		 * @param url URL
		 * @param successHandler 操作成功处理
		 * @param errorHandler 操作失败处理
		 */
		fSubmitForm: function(param, validateSet, url, successHandler, errorHandler) {
			if (form.validate(validateSet)) {
				$.ajax({
					url: url,
					type:'post',
					dataType: "json",
					data: param,
					success: function(data, ts) {
						gUtils.fProcessResult(data, successHandler, errorHandler);
					},
					beforeSend: function() {
						//$('.btn_submit').attr('disabled', true);
					}
				});
			}
		},
		fProcessResult: function(data, successHandler, errorHandler) {
			if (data) {
				if (data['result'] && data['result'] == true) {
					successHandler.call(this,data);
				} else {
					if (errorHandler) {
						errorHandler.call(this,data);
					} else {
						var sMessage=data['message'];
				 		if(sMessage==null){
							sMessage='处理异常，请联系管理员！';
						}
				 		gDialog.fAlert(sMessage);
					}
					//$('.btn_submit').attr('disabled', false);
				}
			}
		},
		/** 获取主内容*/
		fGetBody: function(url, param) {
			this.fGetHtml(url,'main_content' ,param);
		},
		fGetHtml: function(url, id, param) {
			$('#' + id).html('');
			$.ajax({
				url:  url,
				dataType: "html",
				type:'post',
				data: param,
				success: function(data, textStatus) {
					$('#'+ id).html(data);
				},
				beforeSend: function() {
					//gLib.fLoading(id);
				}
			});
		},

		/**
		 * 更新导航
		 * 
		 * @param id
		 * @param text
		 * @param url
		 */
		fUpdateNav : function(flag, id, text, url) {
			if (id == null) return;
			
			if (text!=null&&text!='') {
				var template='';
				var datas={'menuId':id,'menuName':text,'menuUrl':url};
				if(url==null||url==''){
					template='<li id="@{menuId}"><a href="javascript:;">@{menuName}</a> <span class="divider">/</span></li>';
				}else{
					template='<li id="@{menuId}"><a href="javascript:;" onclick="gUtils.fGotoNavLink(\'@{menuUrl}\',\'@{menuId}\')">@{menuName}</a> <span class="divider">/</span></li>';
				}
				var content=this.fRenderTemplate(template,datas);
				if(flag){
					$('#crumbs').html(content);
				}else{
					$('#crumbs').append(content);
				}
			}else{
				$('#' + id).remove();
			}
		},
		
		/**
		 * 跳转到指定页面，同时删除该导航后面的选项
		 */
		fGotoNavLink : function(url,id){
			var next=$("#"+id).next();
			if(next.length>0){
				$(next).remove();
			}
			this.fGetBody(url);
		}
	});
})(jQuery,window);




 /**
  * This tiny script just helps us demonstrate
  * what the various example callbacks are doing
  */
 window.message_box = (function($) {
     "use strict";

     var elem,
         hideHandler,
         that = {};
     var alertStyles=['alert-info','alert-warning','alert-success','alert-danger'];
     
     that.init = function(options) {
     	if(elem){
     		return;
     	}
     	var html='<div id="message_box_info" class="alert alert-info alert-block" style="display:none;width:500px;position:fixed;'+
     	'left:0px;right:0px;margin-left:auto;margin-right:auto;top:30px;z-index:10000;" role="alert"><button type="button" class="close">&times;</button>'+
     	'<span></span></div>';
     	$("body").append(html);
 		elem=$("#message_box_info");
 		elem.find('button.close').click(function(){
 			that.hide();
 		});
     };
     
     that.show = function(text,type,time) {
     	if(elem==null ||elem==undefined){
     		that.init();
     	}
     	 var alertClass='';
     	 if(type=='info'){
     		alertClass='alert-info';
     	 }else if(type=='success'){
     		alertClass='alert-success'; 
     	 }else if(type=='danger'){
     		alertClass='alert-danger'; 
     	 }else{
			alertClass='alert-warning';
		 }
     	 for ( var i = 0; i < alertStyles.length; i++) {
     		 elem.removeClass(alertStyles[i]);
     	 	}
     	 if(alertClass!=''){
     		elem.addClass(alertClass);
     	 }
     	
         clearTimeout(hideHandler);
         elem.find("span").html(text);
         elem.fadeIn();
         if(time!=null || isNaN(time)){
         	time=4000;
         }
         
         hideHandler = setTimeout(function() {
             that.hide();
         }, time);
     };

     that.hide = function() {
         elem.fadeOut();
     };

     return that;
 }(jQuery));