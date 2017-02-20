<?php

$db_host = 'localhost';
$db_user = 'root';
$db_pwd = 'root';
$db_name = 'tplink';

$dsn = "mysql:host=".$db_host.";dbname=".$db_name;
$dbh = new PDO($dsn, $db_user, $db_pwd);

$email = $_GET['email'];
if (empty($email)){
    echo json_encode(array("code"=>-1,"key"=>"Email 不能为空"));
}else{
    $sql_check_email = "SELECT userkey FROM accesskey WHERE email = ?";
    $stmt = $dbh->prepare($sql_check_email);
    $check_email = $stmt->execute(array($email));
    $key_result = $stmt->fetch();
    if($key_result){
        echo json_encode(array("code"=>0,"key"=>$key_result['userkey']));
    }else{
        $sql_insert_userkey = "INSERT INTO accesskey(`userkey`, `email`, `checked`) VALUES(?,?,?)";
        $userkey = md5($email.microtime());
        $stmt = $dbh->prepare($sql_insert_userkey);
        $insert_newkey = $stmt->execute(array($userkey, $email, 1));
        if($insert_newkey){
            echo json_encode(array("code"=>0,"key"=>$userkey));
        }else{
            echo json_encode(array("code"=>-1,"msg"=>"生成accesskey失败"));
        }
    }
}
$dbh = null;
?>