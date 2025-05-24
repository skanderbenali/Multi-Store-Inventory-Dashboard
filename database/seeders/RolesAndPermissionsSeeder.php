<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        
        Permission::create(['name' => 'view dashboard']);
        
        Permission::create(['name' => 'create store integrations']);
        Permission::create(['name' => 'edit store integrations']);
        Permission::create(['name' => 'delete store integrations']);
        Permission::create(['name' => 'view store integrations']);
        
        Permission::create(['name' => 'create products']);
        Permission::create(['name' => 'edit products']);
        Permission::create(['name' => 'delete products']);
        Permission::create(['name' => 'view products']);
        Permission::create(['name' => 'sync products']);
        
        Permission::create(['name' => 'create stock alerts']);
        Permission::create(['name' => 'edit stock alerts']);
        Permission::create(['name' => 'delete stock alerts']);
        Permission::create(['name' => 'view stock alerts']);
        
        Permission::create(['name' => 'create users']);
        Permission::create(['name' => 'edit users']);
        Permission::create(['name' => 'delete users']);
        Permission::create(['name' => 'view users']);
        Permission::create(['name' => 'assign roles']);
        
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());
        
        $managerRole = Role::create(['name' => 'store manager']);
        $managerRole->givePermissionTo([
            'view dashboard',
            'view store integrations',
            'create store integrations',
            'edit store integrations',
            'view products',
            'edit products',
            'sync products',
            'create stock alerts',
            'edit stock alerts',
            'view stock alerts',
        ]);
        
        // Create a default admin user if needed
        // $admin = \App\Models\User::factory()->create([
        //     'name' => 'Admin User',
        //     'email' => 'admin@example.com',
        // ]);
        // $admin->assignRole('admin');
        
        // Create a default store manager if needed
        // $manager = \App\Models\User::factory()->create([
        //     'name' => 'Store Manager',
        //     'email' => 'manager@example.com',
        // ]);
        // $manager->assignRole('store manager');
    }
}
