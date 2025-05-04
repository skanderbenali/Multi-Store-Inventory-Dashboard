# Real-time Notifications System

This document provides an overview of the real-time notification system implemented in the Multi-Store Inventory Dashboard.

## Overview

The application uses Laravel Echo and Pusher to deliver real-time notifications to users for:

1. **Stock Alerts**: When product inventory falls below defined thresholds
2. **Sync Completions**: When inventory synchronization with external platforms completes

## Technical Implementation

### Backend

The notification system uses Laravel's event broadcasting system with the following components:

1. **Events**:
   - `StockAlertTriggered`: Fired when a product's stock falls below a threshold
   - `InventorySyncCompleted`: Fired when an inventory synchronization completes

2. **Channels**:
   - Private user channels (`user.{id}`) ensure notifications are only delivered to the appropriate users

3. **Services**:
   - `InventorySyncService`: Dispatches events when appropriate conditions are met
   - `CheckStockAlertsCommand`: Scheduled command that checks for and dispatches stock alerts

### Frontend

The frontend uses Laravel Echo, a JavaScript library that makes it easy to subscribe to channels and listen for events:

1. **Components**:
   - `NotificationCenter`: Main component that manages notification state and subscribes to channels
   - `NotificationItem`: Renders individual notifications in the notification list
   - `NotificationToast`: Displays real-time popup notifications when events occur

## Setup Instructions

### 1. Environment Configuration

Update your `.env` file with Pusher credentials:

```
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_key
PUSHER_APP_SECRET=your_secret
PUSHER_APP_CLUSTER=your_cluster
```

### 2. Installing Dependencies

```bash
npm install laravel-echo pusher-js
```

### 3. Frontend Configuration

Laravel Echo is already configured in the `resources/js/bootstrap.js` file.

## Using the Notification System

### Stock Alerts

Stock alerts will automatically trigger when:

1. Manual inventory updates bring a product below its threshold
2. Synchronization with an external platform updates inventory below a threshold
3. The `CheckStockAlertsCommand` runs periodically and detects low stock

### Testing Notifications

To manually test the notification system:

1. Set up a Pusher account and configure your `.env` file
2. Create a product with a stock alert threshold 
3. Update the product's quantity to be below the threshold
4. You should see a real-time notification appear in the UI

## Customization

The notification components are highly customizable:

- Update the appearance by modifying the Tailwind classes in the React components
- Add additional notification types by creating new events that implement `ShouldBroadcast`
- Modify the channel structure to target different groups of users or to segment notifications
