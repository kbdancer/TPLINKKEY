$(document).ready(function() {
	wifi.getlist(true);
	setInterval(function(){  wifi.getlist(false); },10000)
	Media = new Audio('resource/images/c.mp3');
	Media.load();
});

var count = 0,Media;

wifi = {
	getlist:function(initPager){
		var rows = 20,getPage = $("#wifilistpager").find("input").val(),
			page = (initPager ? 1:getPage),param;

		param = {"page":page,"rows":rows,"action":"query"};
		$.post("bin/cp.php", param, function(data, textStatus, xhr) {
			var rowLen = data.rows.length,listObjectBox = $("#wifitable").find('tbody');
			listObjectBox.empty();

			for(var i=0;i<data.rows.length;i++){
				var ts = data.rows[i];
				listObjectBox.append('<tr><td>'+ts.id+'</td><td>'+ts.ip+'</td><td>'+ts.mac+'</td><td>'+ts.ssid+'</td><td>'+ts.key+'</td><td>'+ts.country+'</td><td>'+ts.province+'</td><td>'+ts.city+'</td><td>'+ts.isp+'</td><td>'+ts.time+'</td></tr>');
			}

			if(rowLen < 1){
				listObjectBox.append('<tr><td colspan="10" class="nodataTD">暂无数据</td></tr>');
			}

			if(count != parseInt(data.total)){
				Media.play();
			}
			count = parseInt(data.total);

			$("#total_label").text("共 "+data.total+" 条");
			
			if(initPager){
				pagerManager.init(data.total,rows,"wifilistpager",function(){wifi.getlist(false);});
			}
		},"json");
	}
}