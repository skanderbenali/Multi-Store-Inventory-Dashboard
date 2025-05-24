# Shopify Integration Documentation

## Overview

The Multi-Store Inventory Dashboard provides seamless integration with Shopify stores, allowing for automated inventory synchronization and management. This document outlines the setup process, authentication flow, available features, and troubleshooting steps for the Shopify integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Authentication](#authentication)
3. [Integration Setup](#integration-setup)
4. [Synchronization Process](#synchronization-process)
5. [Available Operations](#available-operations)
6. [Webhooks](#webhooks)
7. [Rate Limits](#rate-limits)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

## Prerequisites

Before setting up the Shopify integration, ensure you have:

- A Shopify store (Partner, Developer, or Production account)
- Admin API access to your Shopify store
- Permission to create private apps within your Shopify store

## Authentication

The Multi-Store Inventory Dashboard uses OAuth 2.0 for authenticating with Shopify's Admin API. The application supports two authentication methods:

### Private App Authentication

1. Create a private app in your Shopify admin panel
2. Generate API credentials (API Key and API Secret)
3. Define the necessary scopes (see [Required Scopes](#required-scopes))
4. Enter these credentials in the Store Integration setup form

### OAuth Flow Authentication

The OAuth flow for Shopify follows these steps:

1. User initiates the connection from the dashboard
2. User is redirected to Shopify's authorization page
3. User grants permissions to the application
4. Shopify redirects back with an authorization code
5. The application exchanges this code for access and refresh tokens
6. Tokens are securely stored for future API requests

### Required Scopes

The following scopes are required for full functionality:

- `read_products`: For accessing product information
- `write_products`: For updating product information
- `read_inventory`: For accessing inventory levels
- `write_inventory`: For updating inventory levels
- `read_orders`: For accessing order information (optional)

## Integration Setup

To set up a new Shopify integration:

1. Navigate to "Store Integrations" in the dashboard
2. Click "Add Integration"
3. Select "Shopify" as the platform
4. Enter your Shop URL (e.g., `your-store.myshopify.com`)
5. Enter your API Key (or leave blank for OAuth flow)
6. Enter your API Secret (optional)
7. Enable or disable automatic synchronization
8. Click "Create Integration"

When "Run initial sync immediately" is checked, the system will automatically begin syncing your products after the integration is created.

## Synchronization Process

The application syncs product data from Shopify using the following methods:

### Scheduled Synchronization

By default, the system performs a full synchronization every 4 hours. This schedule can be adjusted in the application settings.

### Manual Synchronization

Users can trigger a manual synchronization by:
1. Navigating to the store integration details page
2. Clicking the "Sync Products" button

### Initial Synchronization

When creating a new integration with "Run initial sync immediately" enabled, the system will perform an initial synchronization in the background.

### What Gets Synchronized

During synchronization, the following data is imported from Shopify:

- Product basic information (title, description, vendor, product type)
- Product variants
- SKUs and barcodes
- Inventory levels across locations
- Product images (up to 5 per product)
- Product status (active/archived)
- Price information

## Available Operations

Once the Shopify integration is set up, you can perform the following operations:

### View Products

- Browse all synchronized Shopify products
- Filter products by various attributes
- Search for specific products

### Update Inventory

- Modify inventory levels across locations
- Batch update multiple products
- Set automatic stock alerts for low inventory

### Product Management

- Update product information (title, description, etc.)
- Modify variant information
- Change product status

## Webhooks

The system can optionally use Shopify webhooks to receive real-time updates about:

- Product creation/updates
- Inventory level changes
- Order creation (affecting inventory)

To enable webhooks, additional setup may be required on your Shopify store.

## Rate Limits

Shopify imposes rate limits on API requests:

- 2 requests per second for most API endpoints
- Bulk operations for inventory updates to avoid rate limiting

The application implements rate limiting strategies to avoid hitting these limits.

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify API credentials are correct
   - Ensure scopes are properly configured
   - Check that the API version is supported

2. **Synchronization Errors**
   - Check Shopify store connectivity
   - Verify product data integrity
   - Review server logs for detailed error messages

3. **Missing Products**
   - Ensure products are not archived in Shopify
   - Verify products have variants with SKUs
   - Check for synchronization filters that might exclude certain products

### Debug Mode

Enable debug mode in the application settings to get more detailed logs during synchronization.

## API Reference

### Shopify Admin API

The integration uses the following Shopify Admin API endpoints:

- `/admin/api/2023-01/products.json` - For product listing and creation
- `/admin/api/2023-01/products/{product_id}.json` - For product details and updates
- `/admin/api/2023-01/inventory_levels.json` - For inventory management
- `/admin/api/2023-01/locations.json` - For retrieving store locations

### Response Format

All Shopify data is normalized to the application's internal format for consistent handling across different platforms.

---

For further assistance with the Shopify integration, please contact our support team.
