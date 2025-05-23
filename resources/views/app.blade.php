<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Texporta') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        
        <!-- React DevTools temporarily disabled -->
        <!-- <script src="http://localhost:8097"></script> -->
    </head>
    <body class="font-sans antialiased">
        @inertia
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (window.location.port === '58349') {
                    if (window.axios) {
                        window.axios.defaults.baseURL = 'http://127.0.0.1:8000';
                        window.axios.defaults.withCredentials = true;
                        window.axios.defaults.headers.common['X-Inertia'] = true;
                    }
                }
            });
        </script>
    </body>
</html>
