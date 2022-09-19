<?php

   // Get login from JSON
   $userData = getRequestInfo();

   $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
   if ($conn->connect_error)
      returnWithError($conn->connect_error);
   else {
      // Get number of contacts that User w/ UserID has
      $stmt = $conn->prepare("SELECT COUNT(*) FROM Contacts WHERE UserID = ?;");
      $stmt->bind_param("i", $userData["userID"]);
      $stmt->execute();
      $result = $stmt->get_result();

      // Check if User has any contacts
      if ($row = $result->fetch_assoc())
         returnWithInfo($row["COUNT(*)"]);
      else
         returnWithError("No contacts found.");

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
      $retValue = '{"totalContacts": 0,"error":"' . $err . '"}';
      sendResultInfoAsJson( $retValue );
   }

   function returnWithInfo($totalContacts) {
      $retValue = '{"totalContacts": ' . $totalContacts . ',"error":""}';
      sendResultInfoAsJson( $retValue );
   }

?>
