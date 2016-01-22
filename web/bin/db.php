<?php
	$db_path = "localhost";
	$db_user = "root";
	$db_pass = "root";
	$db_name = "tpwifikey_keydata";

	$conn = @mysql_connect($db_path,$db_user,$db_pass);
	if(!$conn){
		echo json_encode(array("r" => 88));
		exit;
	}
	mysql_select_db($db_name,$conn);
	mysql_query("set character set 'utf8'");
?>
