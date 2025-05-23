export default function ApplicationLogo({ className }) {
    return (
        <div className={`relative ${className}`}>
            {/* White parallelogram background */}
            <div className="absolute inset-0 bg-white transform skew-x-12 shadow-md rounded-sm"></div>
            
            {/* Logo content */}
            <div className="relative flex items-center px-5 py-2">
                <span className="text-xl font-bold tracking-tight text-indigo-600">Tex</span>
                <span className="text-xl font-bold tracking-tight text-gray-800">porta</span>
                <span className="ml-1 text-xs bg-indigo-600 text-white px-1 rounded-sm">BETA</span>
            </div>
        </div>
    );
}
