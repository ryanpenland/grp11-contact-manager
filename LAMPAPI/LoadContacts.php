<?php

   // Get login from JSON
   $userData = getRequestInfo();

   $loadResults = "";
   $loadCount = 0;

   $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
   if ($conn->connect_error)
      returnWithError($conn->connect_error);
   else {
      // Get User with <login>, <password> combination from database
      $stmt = $conn->prepare("SELECT firstName, lastName, email, phone FROM Contacts WHERE userID = ? LIMIT ?, ?;");
      $stmt->bind_param("iii", $userData["userID"], $userData["offset"], $userData["limit"]);
      $stmt->execute();
      $result = $stmt->get_result();

      while ($row = $result->fetch_assoc()) {
         // Another JSON object in array to be added
         if ($loadCount > 0)
            $loadResults .= ",";

         // Format result into JSON object
         $loadCount++;
         $loadResults .= '{"firstName": "' . $row["firstName"] . '", ';     // firstName
         $loadResults .= '"lastName": "' . $row["lastName"] . '", ';        // lastName
         $loadResults .= '"email": "' . $row["email"] . '", ';              // email
         $loadResults .= '"phone": "' . $row["phone"] . '"}';               // phone
      }

      if ($loadCount == 0)
         returnWithError("No Contacts Found");
      else
         returnWithInfo($loadResults);

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
      sendResultInfoAsJson($retValue);
   }

   function returnWithInfo($loadResults) {
      $retValue = '{"results":[' . $loadResults . '],"error":""}';
      sendResultInfoAsJson($retValue);
   }

?>
