<?php

   // Get JSON payload information
   $inData = getRequestInfo();

   $searchResults = "";
   $searchCount = 0;

   $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

   if ($conn->connect_error)
      returnWithError($conn->connect_error);
   else {
      // Select columns to send as JSON payload using wildcards w/ search
      $stmt = $conn->prepare("SELECT firstName, lastName, email, phone, ID FROM Contacts WHERE ((firstName like ? OR lastName like ? ) AND UserID = ?) LIMIT ?, ?;");
      $contactName = "%" . $inData["search"] . "%";
      $stmt->bind_param("ssiii", $contactName, $contactName, $inData["userID"], $inData["offset"], $inData["limit"]);
      $stmt->execute();
      $result = $stmt->get_result();

      // Assemble search results into JSON payload
      while($row = $result->fetch_assoc()) {
         // Another JSON object in array to be added
         if ($searchCount > 0)
            $searchResults .= ",";

         // Format result into JSON object
         $searchCount++;
         $searchResults .= '{"firstName": "' . $row["firstName"] . '", ';     // firstName
         $searchResults .= '"lastName": "' . $row["lastName"] . '", ';        // lastName
         $searchResults .= '"email": "' . $row["email"] . '", ';              // email
         $searchResults .= '"phone": "' . $row["phone"] . '", ';              // phone
         $searchResults .= '"dateCreated": "' . $row["dateCreated"] . '", ';  // dateCreated
         $searchResults .= '"ID": "'. $row["ID"] . '"}';                      // ID
      }

      // No Contacts with search-parameters found in database
      if ($searchCount == 0)
         returnWithError("No Contacts Found");
      else
         returnWithInfo($searchResults);

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

   function returnWithInfo($searchResults) {
      $retValue = '{"results":[' . $searchResults . '],"error":""}';
      sendResultInfoAsJson($retValue);
   }
?>
