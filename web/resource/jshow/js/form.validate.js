/**
 * 表单验证 Javascript
 * 注：同一时刻只显示一条提信息
 */

(function($,w){
	w.form = w.form || {};
	var wform=w.form;
	
	$.extend(wform,{
		
		message : {
				must: '该输入项不能为空',
				maxlength: '该字段的长度不能大于#max',
				minlength: '该字段的长度不能小于#min',
				equalTo: '两次输入的值不一致',
				email: '这不是一个标准的Email地址',
				url: '这不是一个标准的url地址',
				ip: '这不是一个标准的ip地址',
				'int': '该字段只能为整数',
				'float': '该字段只能为浮点数',
				mobile: '这不是一个标准的手机号码',
				idCard: '这不是一个标准的身份证号码',
				max: '该字段的值不能大于#max',
				min: '该字段的值不能小于#min',
				server: '该字段的值已存在',
				ilegelstr: '输入中请不要包含半角标点符号',
				dateBeforeNow:"日期应早于等于当前日期时间",
				dateAfterNow:"日期应晚于当前日期时间",
				'number': '该字段只能为数字'
			},
		validate : function(set) {
				
				/**
				 * 增加自定义白名单正则表达式验证规则
				 * 
				 * @param string 字符串
				 * @param reg 白名单正则表达式规则
				 * @returns
				 */
				function isLegelString(string, reg) {
					if(reg == false){
						return true;
					}
					var pattern = reg ? reg : /^[a-zA-Z0-9\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01\r\n\t\s\;\:\.\&\=\%\?\-\/\@\_\!\,\[\]\{\}\"]*$/;
					return pattern.test(string);
				};
				
				var validateResult=true;
				for (var id in set) {
					var a = set[id];
					var oo = document.getElementById(id);
					if(oo==null||oo==undefined){
						continue;
					}
					var v = oo.value;
					var r = true;
					var reg = a['reg'];
					
					// 先不验证特殊字符
					// 统一到后台处理
					if (reg&&!isLegelString(v, reg)) {
						form.showTip(id, a['ilegelstrMsg'] ? a['ilegelstrMsg'] : form.message.ilegelstr, a['r'], a['p']);
						validateResult=false;
						continue;
					}
					
					if (a['must']) {
						r = form.validateItem(id, a, v);
						if (!r){
							validateResult=false;
							continue;
						}
					} else if (v != null && v != '' && typeof v != 'undefined'){
						r = form.validateItem(id, a, v);
						if (!r) {
							validateResult=false;
							continue;
						}
					}
					
					form.hideTip(id);
				}
				
				return validateResult;
			},
			validateItem : function(id, a, v) {
				var flag = true;
				
				if (a['must']) {
					if (form.validator.empty(v)) {
						form.showTip(id, a['msg'] ? a['msg'] : form.message.must, a['r'], a['p']);
						return false;
					} else {
						form.hideTip(id);
					}
				}
				
				if (a['maxlength']) {
					if (v.length > a['maxlength']) {
						var tip = a['maxlengthMsg'] ? a['maxlengthMsg'] : form.message.maxlength;
						tip = tip.replace('#max', a['maxlength']);
						form.showTip(id, tip, a['r'], a['p']);
						return false;
					} else {
						form.hideTip(id);
					}
				}
				
				if (a['minlength']) {
					
					if (v.length < a['minlength']) {
						var tip = a['minlengthMsg'] ? a['minlengthMsg'] :  form.message.minlength;
						tip = tip.replace('#min', a['minlength']);
						form.showTip(id, tip, a['r'], a['p']);
						return false;
					} else {
						form.hideTip(id);
					}
				}
				
				if (a['equalTo']) {
					if ($('#' + a['equalTo']).val() != v) {
						form.showTip(id, a['equalToMsg'] ? a['equalToMsg'] : form.message.equalTo, a['r'], a['p']);
						return false;
					} else {
						form.hideTip(id);
					}
				}

				if (a['handler']) {
					var fun = eval('form.validator.' + a['handler']);
					if (!fun(v)) {
						form.showTip(id, a['handlerMsg'] ? a['handlerMsg'] : form.message[a['handler']], a['r'], a['p']);
						return false;
					} else {
						form.hideTip(id);
					}
				}
				
				if (a['server']) {
					var url = a['server']['url'];
					var pname = a['server']['pname'];
					var msg = a['server']['msg'];
					if (!form.validator.requestValidate(url, pname, v)) {
						form.showTip(id, msg ? msg : form.message[a['server']], a['r'], a['p']);
						return false;
					} else {
						form.hideTip(id);
					}
				}
				
				return flag;
			},
			showTip : function(id, msg, r, p) {
				var jError=jQuery('#' + id + '_error');
				var jInput=$("#"+id);
				if(jError.length>0){
					jError.html(msg);
					jError.show();
				}else{
					var errorHtml='<br/><span id="'+id + '_error" style="color:red">'+msg+"</span>";
					jInput.parent().append(errorHtml);
				}
				$('#' + id).focus(function() {
					form.hideTip(id);
				});
				
			},
			hideTip : function(id) {
				var jError=jQuery('#' + id + '_error');
				jError.hide().html('');
			},
			validator : {
						empty: function(value) {
							return value = null || value == '' || value == 'null' || typeof value == 'undefined' || value == 'undefined';
						},
						requestValidate: function(url, pname, v) {
							var flag = false;
							url += '?' + pname + '=' + v;
							$.ajax({
								url: url,
								type: "POST",
								cache: false,
								async: false,
								dataType: "json",
								data: {},
								success: function(data, textStatus) {
									flag = data['flag'];
								}
							});
							return !flag;
						},
						
						// 以下是验证handler的validator，扩展时在此下添加即可
						email: function(v) {
							var reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
							return reg.test(v);
						},
						ip: function(v) {
							
						},
						'int': function(v) {
							var re = /^[0-9]\d*$/;
							if (!re.test(v)){
								return false;
							}
							return true;
						},
						tel: function(v) {
							var reg = /^[0-9\-]*$/;
							return reg.test(v);
						},
						url: function(v) {
							var reg = /^[a-zA-Z0-9\-\_\:\.\&\=\%\?\/\@]*$/;
							return reg.test(v);
						},
						letterAndNum: function(v) {
							var reg = /^[a-zA-Z0-9_-]{1,}$/; 
							return v.match(reg);
						},
						dateBeforeNow:function(v){
							if(v==null||v=='')
								return false;
							var now=new Date();
							var dateTime=Date.parse(v.replace(/-/g,"/"));
							return (dateTime<=now);
						},
						dateAfterNow:function(v){
							if(v==null||v=='')
								return false;
							var now=new Date();
							var dateTime=Date.parse(v.replace(/-/g,"/"));
							return (dateTime>now);
						},
						'number': function(v) {
							return !isNaN(v);
						}
					},
					friend :{
					init: function(set) {
						var obj;
						var id;
						var tip = '';
						for (var setItem in set) {
							id = setItem;
							obj = $('#' + id);
							tip = set[setItem]['ftip'];
							tip = tip ? tip : '';
							obj.parent().append('<span id="' + id + '_tips" class="message_remind_form">' + tip + '</span>');
							obj.focus(function(e) {
								var eid = $(this).attr('id');
								$('.message_remind_form').removeClass('current');
								$('#' + eid + '_tips').addClass('current');
							});
						}
					}
				}
		
	});

})(jQuery,window);
