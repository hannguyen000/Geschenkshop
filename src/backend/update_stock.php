<?php
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

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id']) && isset($data['anzahl'])) {
    $id = intval($data['id']);
    $anzahl = intval($data['anzahl']);

    // Update query
    $query = "UPDATE shop SET Anzahl = ? WHERE ID = ?";
    $stmt = $link->prepare($query);
    $stmt->bind_param("ii", $anzahl, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Lagerbestand aktualisiert']);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Ungültige Daten']);
}

$link->close();
?>