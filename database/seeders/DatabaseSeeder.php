<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Always seed roles and permissions first
        $this->call(RolesAndPermissionsSeeder::class);
        
        // Uncomment for local development to create test users
        // \App\Models\User::factory()->create([
        //     'name' => 'Admin User',
        //     'email' => 'admin@example.com',
        //     'password' => bcrypt('password'),
        // ])->assignRole('admin');
        
        // \App\Models\User::factory()->create([
        //     'name' => 'Store Manager',
        //     'email' => 'manager@example.com',
        //     'password' => bcrypt('password'),
        // ])->assignRole('store manager');
    }
}
