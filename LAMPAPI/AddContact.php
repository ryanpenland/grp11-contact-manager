<?php

   // Get registration info from JSON
   $userData = getRequestInfo();

   $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
   if ($conn->connect_error)
      returnWithError($conn->connect_error);
   else {
      // Add User to database with <userData>
      $stmt = $conn->prepare("INSERT INTO Contacts (firstName, lastName, email, phone, UserID) VALUES (?, ?, ?, ?, ?);");
      $stmt->bind_param("ssssi", $userData["firstName"], $userData["lastName"], $userData["email"], $userData["phone"], $userData["userID"]);
      $stmt->execute();
      $stmt->close();
      $conn->close();
   }

   function getRequestInfo() {
      return json_decode(file_get_contents('php://input'), true);
   }
?>
