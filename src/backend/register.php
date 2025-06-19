<?php

$data = json_decode(file_get_contents("php://input"), true);

$regusername = $data['regusername'];
$regpassword = $data['regpassword']; 
$email = $data['email'];
$strasse = $data['strasse'];
$ort = $data['ort'];
$plz = $data['plz'];

// Hier würdest du normalerweise eine Verbindung zu deiner Datenbank herstellen und die Registrierungslogik implementieren
// Database connection settings
$host = "localhost";
$username = "g01";
$password = "wi22gis";
$database = "g01";

// Create connection
$link = new mysqli($host, $username, $password, $database);

// Check connection
if ($link->connect_error) {
    die("Connection failed: " . $link->connect_error);
}

//Check if the user is already exist 
$sql = "SELECT * FROM users WHERE username = '$regusername'";
$result = $link->query($sql);


if ($result->num_rows > 0) {
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row; // Zeile zum Array hinzufügen
    }

    // JSON-Antwort mit den gefundenen Benutzern
    echo json_encode([
        'success' => false,
        'error' => 'Benutzername bereits vorhanden.',
        'data' => $users // Hier werden die gefundenen Benutzerdaten zurückgegeben
    ]);
} else {
    $sql = "INSERT INTO users (username, pw, email, strasse, ort, plz) VALUES ('$regusername', '$regpassword', '$email', '$strasse', '$ort', '$plz')";
    
    if ($link->query($sql) === TRUE) {
        $userID = $link->insert_id;
        echo json_encode(['success' => true, 'UserID' => $userID]);
      } else {
        echo json_encode(['success' => false, 'error' => 'Fehler beim Registrieren.']);
      }
  }

  $link->close();
  ?>
