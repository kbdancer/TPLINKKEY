<?php

$db_host = 'localhost';
$db_user = 'root';
$db_pwd = 'root';
$db_name = 'tplink';

$dsn = "mysql:host=".$db_host.";dbname=".$db_name;
$dbh = new PDO($dsn, $db_user, $db_pwd);

$email = $_POST['email'];
$userkey = $_POST['key'];
$host = $_POST['host'];
$mac = $_POST['mac'];
$ssid = $_POST['ssid'];
$wifikey = $_POST['wifikey'];
$country = $_POST['country'];
$province = $_POST['province'];
$city = $_POST['city'];
$isp = $_POST['isp'];


if (empty($email)){
    echo json_encode(array("code"=>-1,"msg"=>"Email 不能为空"));
}else if(empty($userkey)){
    echo json_encode(array("code"=>-1,"msg"=>"key 不能为空"));
}else{
    $sql_check_email = "SELECT userkey FROM accesskey WHERE email = ? and userkey = ?";
    $stmt = $dbh->prepare($sql_check_email);
    $check_email = $stmt->execute(array($email, $userkey));
    $key_result = $stmt->fetch();
    if($key_result){
        $query_same = 'SELECT id FROM scanlog WHERE mac = ? and ssid = ? and wifikey = ?';
        $stmt = $dbh->prepare($query_same);
        $check_same = $stmt->execute(array($mac, $ssid, $wifikey));
        $same_id = $stmt->fetch();

        if($same_id){
            echo json_encode(array("code"=>-2,"msg"=>"数据已经存在"));
        }else{
            $sql_insert_data = "INSERT INTO scanlog(`host`,`mac`,`ssid`,`wifikey`,`country`,`province`,`city`,`isp`) VALUES(?,?,?,?,?,?,?,?)";
            $stmt = $dbh->prepare($sql_insert_data);
            $insert_newdata = $stmt->execute(array($host, $mac, $ssid, $wifikey, $country, $province, $city, $isp));
            if($insert_newdata){
                echo json_encode(array("code"=>0,"msg"=>"插入数据成功"));
            }else{
                echo json_encode(array("code"=>-1,"msg"=>"插入数据失败"));
            }
        }
    }else{
        echo json_encode(array("code"=>-1,"msg"=>"key 或 email 无效"));
    }
}
$dbh = null;
?>