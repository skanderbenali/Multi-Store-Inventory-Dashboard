# Multi-Store Inventory Dashboard

<p align="center">
<img src="https://img.shields.io/badge/Laravel-10.x-red" alt="Laravel Version">
<img src="https://img.shields.io/badge/PHP-8.1+-blue" alt="PHP Version">
<img src="https://img.shields.io/badge/React-18.x-blue" alt="React Version">
<img src="https://img.shields.io/badge/Inertia.js-1.x-purple" alt="Inertia.js Version">
<img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

## About Multi-Store Inventory Dashboard

Multi-Store Inventory Dashboard is a comprehensive solution for managing product inventory across multiple e-commerce platforms like Shopify, Etsy, and Amazon. The application provides real-time synchronization, stock alerts, and a unified dashboard to monitor your entire inventory ecosystem.

## Key Features

### API Integrations
- **Shopify Integration**: Complete integration with Shopify Admin API for product synchronization and inventory management
- **Etsy Integration**: Integration with Etsy Open API for listings management and inventory updates
- **Amazon Integration**: Connection to Amazon SP-API for product catalog and inventory management

### Inventory Management
- **Cross-Platform Synchronization**: Keep inventory levels synchronized across all your e-commerce platforms
- **Individual Product Management**: View and update product details across all connected stores
- **Batch Operations**: Perform bulk updates and synchronization across multiple products

### Real-time Notifications
- **Stock Alerts**: Receive instant notifications when product stock levels fall below specified thresholds
- **Sync Notifications**: Get updates when synchronization operations complete
- **Custom Threshold Settings**: Set individual stock thresholds for each product

### Dashboard & Reporting
- **Unified Dashboard**: View all your inventory data in one place
- **Platform Metrics**: See performance and stock levels broken down by platform
- **Visual Data Representation**: Charts and graphs to visualize inventory status

## Technology Stack

- **Backend**: Laravel 10.x with PHP 8.1+
- **Frontend**: React 18.x with Inertia.js
- **Styling**: TailwindCSS
- **Real-time**: Laravel Echo with Pusher for real-time notifications
- **Authentication**: Laravel Breeze with Spatie Permissions for role management

## Installation

### Requirements
- PHP 8.1 or higher
- Node.js and NPM
- Composer
- MySQL or compatible database

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/skanderbenali/Multi-Store-Inventory-Dashboard.git
   cd Multi-Store-Inventory-Dashboard
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Set up environment file**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database connection in .env file**
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password
   ```

5. **Set up Pusher for real-time notifications**
   ```
   BROADCAST_DRIVER=pusher
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_APP_KEY=your_pusher_key
   PUSHER_APP_SECRET=your_pusher_secret
   PUSHER_APP_CLUSTER=your_pusher_cluster
   ```

6. **Configure API credentials for your e-commerce platforms**
   ```
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_API_SECRET=your_shopify_api_secret
   
   ETSY_API_KEY=your_etsy_api_key
   ETSY_API_SECRET=your_etsy_api_secret
   
   AMAZON_CLIENT_ID=your_amazon_client_id
   AMAZON_CLIENT_SECRET=your_amazon_client_secret
   ```

7. **Run migrations**
   ```bash
   php artisan migrate
   ```

8. **Install NPM dependencies and build assets**
   ```bash
   npm install
   npm run dev
   ```

9. **Start the local development server**
   ```bash
   php artisan serve
   ```

## Usage

### Setting Up Store Integrations
1. Navigate to the Store Integrations page
2. Click "Add New Integration"
3. Select the platform (Shopify, Etsy, or Amazon)
4. Provide necessary API credentials
5. Complete the OAuth flow if required

### Managing Products
1. Products will be automatically synced from your connected stores
2. View all products on the Products page
3. Click on a product to view detailed information
4. Use the "Sync" button to manually update inventory for specific products

### Setting Up Stock Alerts
1. Navigate to a product's detail page
2. Click "Add Stock Alert"
3. Set the threshold quantity
4. Save the alert

### Dashboard
- The dashboard provides an overview of your entire inventory ecosystem
- View recent synchronization activities
- Monitor stock alerts
- See platform-specific metrics

## Schedule Configuration

The application includes scheduled tasks for regular inventory synchronization and stock alert checking. These are configured in the `app/Console/Kernel.php` file:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('inventory:sync-all-stores')->hourly();
    $schedule->command('inventory:check-stock-alerts')->everyThirtyMinutes();
}
```

Make sure to set up a cron job to run the scheduler:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## Documentation

Additional documentation is available in the `docs` directory:

- [Notifications System](docs/NOTIFICATIONS.md): Details about the real-time notification system

## License

The Multi-Store Inventory Dashboard is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
