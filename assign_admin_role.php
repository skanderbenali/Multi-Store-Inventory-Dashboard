<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get the first user and assign admin role
$user = \App\Models\User::first();

if ($user) {
    echo "Found user: " . $user->name . " (" . $user->email . ")\n";
    $user->assignRole('admin');
    echo "Admin role assigned successfully!\n";
} else {
    echo "No users found in the database.\n";
}
