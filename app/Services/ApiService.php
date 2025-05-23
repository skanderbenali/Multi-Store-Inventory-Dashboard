<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\StoreIntegration;

abstract class ApiService
{
    protected StoreIntegration $storeIntegration;
    protected string $baseUrl;
    protected array $headers = [];
    protected int $timeout = 30;
    protected int $retries = 3;
    
    public function __construct(StoreIntegration $storeIntegration)
    {
        $this->storeIntegration = $storeIntegration;
        $this->initializeService();
    }
    
    
    abstract protected function initializeService(): void;
    
    
    protected function get(string $endpoint, array $queryParams = []): array
    {
        return $this->request('GET', $endpoint, ['query' => $queryParams]);
    }
    
    
    protected function post(string $endpoint, array $data = []): array
    {
        return $this->request('POST', $endpoint, ['json' => $data]);
    }
    
    
    protected function put(string $endpoint, array $data = []): array
    {
        return $this->request('PUT', $endpoint, ['json' => $data]);
    }
    
    
    protected function delete(string $endpoint): array
    {
        return $this->request('DELETE', $endpoint);
    }
    
    
    protected function request(string $method, string $endpoint, array $options = []): array
    {
        $url = $this->buildUrl($endpoint);
        $options['headers'] = $this->headers;
        
        $response = null;
        $attempts = 0;
        $success = false;
        $lastException = null;
        
        while (!$success && $attempts < $this->retries) {
            try {
                $attempts++;
                $http = Http::timeout($this->timeout);
                
                // Skip SSL verification for development environments
                if (app()->environment('local', 'development', 'testing')) {
                    $http = $http->withoutVerifying();
                }
                
                $response = $http->withOptions($options)
                    ->{strtolower($method)}($url);
                
                if ($response->successful()) {
                    $success = true;
                } else {
                    
                    Log::warning('API request failed', [
                        'store_integration_id' => $this->storeIntegration->id,
                        'platform' => $this->storeIntegration->platform,
                        'url' => $url,
                        'method' => $method,
                        'attempt' => $attempts,
                        'status' => $response->status(),
                        'response' => $response->json() ?? $response->body()
                    ]);
                    
                    // Wait before retrying (exponential backoff)
                    if ($attempts < $this->retries) {
                        sleep(pow(2, $attempts - 1));
                    }
                }
            } catch (\Exception $e) {
                $lastException = $e;
                
                
                Log::error('API request exception', [
                    'store_integration_id' => $this->storeIntegration->id,
                    'platform' => $this->storeIntegration->platform,
                    'url' => $url,
                    'method' => $method,
                    'attempt' => $attempts,
                    'exception' => $e->getMessage()
                ]);
                
                // Wait before retrying (exponential backoff)
                if ($attempts < $this->retries) {
                    sleep(pow(2, $attempts - 1));
                }
            }
        }
        
        if (!$success) {
            if ($response) {
                return [
                    'success' => false,
                    'error' => $response->json()['errors'] ?? $response->json()['error'] ?? 'API request failed with status: ' . $response->status(),
                    'status' => $response->status()
                ];
            } elseif ($lastException) {
                return [
                    'success' => false,
                    'error' => $lastException->getMessage(),
                    'status' => 500
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'API request failed with unknown reason',
                    'status' => 500
                ];
            }
        }
        
        return [
            'success' => true,
            'data' => $response->json() ?? [],
            'status' => $response->status()
        ];
    }
    

    protected function buildUrl(string $endpoint): string
    {
        return rtrim($this->baseUrl, '/') . '/' . ltrim($endpoint, '/');
    }
}

