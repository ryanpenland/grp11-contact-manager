<?php

   // Get login from JSON
   $userData = getRequestInfo();

   // Placeholder variables
   $id = -1;
   $firstName = "";
   $lastName = "";

   $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
   if ($conn->connect_error)
      returnWithError($conn->connect_error);
   else {
      // Get User with <login>, <password> combination from database
      $stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login = ? AND Password = ?;");
      $stmt->bind_param("ss", $userData["login"], $userData["password"]);
      $stmt->execute();
      $result = $stmt->get_result();

      // Check if User exists in database
      if ($row = $result->fetch_assoc())
         returnWithInfo($row['FirstName'], $row['LastName'], $row['ID']);
      else
         returnWithError("No user found with that login information.");

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
      $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
      sendResultInfoAsJson( $retValue );
   }

   function returnWithInfo($firstName, $lastName, $id) {
      $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
      sendResultInfoAsJson( $retValue );
   }

?>
