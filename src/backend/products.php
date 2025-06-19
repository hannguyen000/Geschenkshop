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

// Query to fetch data from the 'shop' table
$query = "SELECT * FROM shop";
$result = $link->query($query);

// Base URL for the images
$base_url = "https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/";

// Check if any records are found
if ($result->num_rows > 0) {
    // Prepare an array to hold the products data
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Check if the image path is relative, and add the base URL if necessary
        $image_url = $row['Bild'];
        if (strpos($image_url, 'http') === false) {
            // If the image URL is relative, prepend the base URL
            $image_url = $base_url . $image_url;
        }
        
        // Add each product to the products array
        $products[] = [
            'id' => $row['ID'], 
            'bild' => $image_url, // Ensure image URL is correct
            'name' => $row['Name'], 
            'beschreibung' => $row['Beschreibung'],
            'preis' => $row['Preis'],
            'anzahl' => $row['Anzahl']
        ];
    }
    // Return the data as a JSON response
    echo json_encode(value: ['products' => $products]);
} else {
    // If no records are found, return an empty array
    echo json_encode(['products' => []]);
}

// Close the database connection
$link->close();
?>
