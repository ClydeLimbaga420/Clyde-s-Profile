<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$db = new PDO("sqlite:" . __DIR__ . "/likes.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create table if it doesn't exist
$db->exec("
    CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1022
    )
");

// Make sure the initial row exists
$db->exec("
    INSERT OR IGNORE INTO likes (id, count)
    VALUES (1, 1022)
");

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $stmt = $db->query("SELECT count FROM likes WHERE id = 1");
    $likes = $stmt->fetchColumn();

    echo json_encode([
        "likes" => (int)$likes
    ]);

    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $db->exec("
        UPDATE likes
        SET count = count + 1
        WHERE id = 1
    ");

    $stmt = $db->query("SELECT count FROM likes WHERE id = 1");
    $likes = $stmt->fetchColumn();

    echo json_encode([
        "likes" => (int)$likes
    ]);

    exit;
}

http_response_code(405);

echo json_encode([
    "error" => "Method not allowed"
]);