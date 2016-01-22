<?php
	require_once "db.php";

	$action =$_POST['action'];
	$page = $_POST['page'];
	$rows = 20;
	// $rows = $_POST['rows'];

	switch ($action) {
		case 'login':
			# code...
			break;
		case 'query':
			query($page,$rows);
			break;
		case 'form':
			gettotal();
			break;
		default:
			echo json_encode(array('r'=>33));
			break;
	}

	function query($page,$rows){
		$querywifi = sprintf(
			"SELECT * FROM tpwifikey_keydata order by createtime desc limit %d,%d;",
			mysql_real_escape_string(($page-1)*$rows),
			mysql_real_escape_string($rows)
		); 

		$total = mysql_num_rows(mysql_query("SELECT id FROM tpwifikey_keydata"));
		$wifilist = mysql_query($querywifi);
		$wifiarr = array();
		$i = 0;
		
		while( $row = mysql_fetch_array($wifilist) ){
			
			$iparr = explode('.', $row['ip']);
			$macarr = explode(':', $row['mac']);

			$wifiarr[$i] = array(
				"id"=>$row['id'],
				"ip"=>$iparr[0].'.*.*.'.$iparr[3],
				"ssid"=>$row['ssid'],
				"key"=>$row['password'],
				"mac"=>$macarr[0].':'.$macarr[1].':*:*:*:'.$macarr[5],
				"time"=>$row['createtime'],
				"country"=>$row['country'],
				"province"=>$row['province'],
				"city"=>$row['city'],
				"isp"=>$row['isp']
			);

			$i = $i + 1;
		}

		$resarr = array(  
		    'MZCode' => 0,  
		    'total' => $total,  
		    'rows' =>$wifiarr
		);  
		 
		echo json_encode($resarr);  
	}

	function gettotal(){
		$total = mysql_num_rows(mysql_query("SELECT id FROM tpwifikey_keydata"));
		echo json_encode(array('c'=>$total));
	}

	function login(){

	}
?>