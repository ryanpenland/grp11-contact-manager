<?php

   // Get registration info from JSON
   $userData = getRequestInfo();

   $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
   if ($conn->connect_error)
      returnWithError($conn->connect_error);
   else {
      // Add User to database with <userData>
      $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?);");
      $stmt->bind_param("ssss", $userData["firstName"], $userData["lastName"], $userData["login"], $userData["password"]);

      if (!$stmt->execute())
         returnWithError("A user with that login already exists");

      $stmt->close();
      $conn->close();
   }

   function getRequestInfo() {
      return json_decode(file_get_contents('php://input'), true);
   }

   function sendResultInfoAsJson($obj) {
      header('Content-type: application/json');
      echo $obj;
   }

   function returnWithError($err) {
      $retValue = '{"error":"' . $err . '"}';
      sendResultInfoAsJson( $retValue );
   }
?>
