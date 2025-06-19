<?php
// Verbindung zur Datenbank herstellen
$host = "localhost";
$username = "g01";
$password = "wi22gis";
$database = "g01";

$link = new mysqli($host, $username, $password, $database);

// Verbindung prüfen
if ($link->connect_error) {
    die("Connection failed: " . $link->connect_error);
}

// Anfragedaten (JSON) abrufen
$requestData = json_decode(file_get_contents('php://input'), true);

// Überprüfen, ob Benutzername und Passwort gesendet wurden
if (isset($requestData['username']) && isset($requestData['password'])) {
    $username = $requestData['username'];
    $password = $requestData['password'];

    // Benutzer in der Datenbank suchen
    $sql = "SELECT * FROM users WHERE username = ?";  // Sửa câu lệnh SQL
    $stmt = $link->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Kiểm tra mật khẩu
        if ($user['pw'] === $password) {
            // Token generieren und zurückgeben
            $token = generateToken(['username' => $user['username']]);
            header('Content-Type: application/json');
            echo json_encode(['token' => $token, 'user' => $user]);
        } else {
            // Falsches Passwort
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Falsches Passwort']);
        }
    } else {
        // Benutzername existiert nicht
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Bitte geben richtige Benutzername und Password ein']);
    }
} else {
    // Fehlende Eingaben
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Benutzername oder Passwort fehlt']);
}

$link->close();

// Funktion zum Generieren eines Tokens
function generateToken($payload) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode($payload));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", 'YOUR_SECRET_KEY', true)); 
    // 'YOUR_SECRET_KEY' durch Ihren tatsächlichen geheimen Schlüssel ersetzen
    return "$header.$payload.$signature";
}
?>
