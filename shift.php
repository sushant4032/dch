<?php
$servername = "localhost";
$username = "dch";
$password = "kitkat";
$dbname = "dudhichua";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

echo "connected";

$conn->close();
?>


 
// $postdata = file_get_contents("php://input");
// $req=json_decode($postdata);

// $command=$req->command;

// if($command=='post'){
//     $shift=$req->shift;
//     $data=$req->t;
//     $sql = "INSERT INTO shift (shift, data)
//     VALUES ('$shift', '$data')";

//     if ($conn->query($sql) === TRUE) {
//         echo "New record created successfully";
//     } else {
//         echo "Error: " . $sql . "<br>" . $conn->error;
//     }
// }
// else if($command=='get'){
//     $shift=$req->shift;
//     $sql = "SELECT shift, data  FROM shift WHERE shift=".$shift;
//     $result = mysqli_query($conn, $sql);
//     $rows = array();
//     while($r = mysqli_fetch_assoc($result)) {
//     $rows[] = $r;
//     }
//     echo json_encode($rows);
// }

