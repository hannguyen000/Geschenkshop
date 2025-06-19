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
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $link->connect_error]);
    exit();
}

// Fetch all orders
$sql = "SELECT * FROM orders";
$result = $link->query($sql);

header('Content-Type: application/json');

if ($result && $result->num_rows > 0) {
    $orders = []; 
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'amount_total' => $row['amount_total'],
            'currency' => $row['currency'],
            'time' => $row['created_at']
        ];
    }
    echo json_encode(['orders' => $orders]); 
} else {
    echo json_encode(['orders' => []]); 
}
// Close the database connection
$link->close();
?>
