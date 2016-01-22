<?php
	include 'db.php';

	$user = $_POST['user'];
	$code = $_POST['code'];
	$ip = $_POST['ip'];
	$mac = $_POST['mac'];
	$ssid = $_POST['ssid'];
	$password = $_POST['key'];
	$country = $_POST['land'];
	$province = $_POST['pro'];
	$city = $_POST['city'];
	$createtime = $_POST['time'];
	$isp = $_POST['isp'];

	//登录
	$login = 	sprintf("SELECT * FROM tpwifikey_user where username='%s' and code='%s'",   
            		mysql_real_escape_string($user),   
                	mysql_real_escape_string($code)
                );

    $loginRes = mysql_query($login);

    if(empty($loginRes)){
    	echo json_encode(array('r'=>99));
    	exit;
    }

	//查重

	if(empty($ip)){
		echo json_encode(array('r'=>33));
		exit;
	}

	$check = 	sprintf("SELECT id FROM tpwifikey_keydata where ssid='%s' and password='%s'",   
            		mysql_real_escape_string($ssid),   
                	mysql_real_escape_string($password)
                );

	$checkRes = mysql_query($check);
	$haveid = mysql_fetch_row($checkRes);

    if(mysql_num_rows($checkRes) > 0){
    	//update
    	$updatewifi = sprintf("UPDATE tpwifikey_keydata SET mac='%s' WHERE id='%s';",mysql_real_escape_string($mac),$haveid[0]);
    	mysql_query($updatewifi);
    	echo json_encode(array('r'=>22));
    	exit;
    }

	//插入
	$insertwifi = sprintf("INSERT INTO tpwifikey_keydata(ip, mac ,ssid, password, createtime,country,province,city,isp) VALUES('%s','%s','%s','%s','%s','%s','%s','%s','%s')",
							mysql_real_escape_string($ip),   
							mysql_real_escape_string($mac),   
							mysql_real_escape_string($ssid),   
							mysql_real_escape_string($password),   
							mysql_real_escape_string($createtime),   
							mysql_real_escape_string($country),   
							mysql_real_escape_string($province),   
							mysql_real_escape_string($city),   
							mysql_real_escape_string($isp)
						);

	mysql_query($insertwifi);
	echo json_encode(array("r"=>0));
?>