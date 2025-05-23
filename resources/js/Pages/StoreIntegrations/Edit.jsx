import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DeleteButton from '@/Components/SecondaryButton';

export default function Edit({ auth, storeIntegration }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: storeIntegration.name || '',
        platform: storeIntegration.platform || 'shopify',
        shop_url: storeIntegration.shop_url || '',
        api_key: storeIntegration.api_key || '',
        api_secret: '', // Don't populate for security reasons
        is_active: storeIntegration.is_active,
    });
    
    const [showSecret, setShowSecret] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch(route('store-integrations.update', storeIntegration.id));
    };
    
    const confirmDeletion = () => {
        setConfirmingDeletion(true);
    };
    
    const cancelDeletion = () => {
        setConfirmingDeletion(false);
    };
    
    const renderPlatformFields = () => {
        switch (data.platform) {
            case 'shopify':
                return (
                    <>
                        <div className="mb-4">
                            <InputLabel htmlFor="shop_url" value="Shopify Store URL" />
                            <TextInput
                                id="shop_url"
                                type="text"
                                name="shop_url"
                                value={data.shop_url}
                                className="mt-1 block w-full"
                                placeholder="yourstore.myshopify.com"
                                onChange={(e) => setData('shop_url', e.target.value)}
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">Enter your Shopify store URL without https://</p>
                            <InputError message={errors.shop_url} className="mt-2" />
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="api_key" value="API Key" />
                            <TextInput
                                id="api_key"
                                type="text"
                                name="api_key"
                                value={data.api_key}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('api_key', e.target.value)}
                                required
                            />
                            <InputError message={errors.api_key} className="mt-2" />
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="api_secret" value="API Secret (leave blank to keep current)" />
                            <div className="relative">
                                <TextInput
                                    id="api_secret"
                                    type={showSecret ? "text" : "password"}
                                    name="api_secret"
                                    value={data.api_secret}
                                    className="mt-1 block w-full pr-10"
                                    onChange={(e) => setData('api_secret', e.target.value)}
                                    placeholder="Leave blank to keep current value"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-1"
                                    onClick={() => setShowSecret(!showSecret)}
                                >
                                    {showSecret ? (
                                        <svg className="h-6 w-6 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.api_secret} className="mt-2" />
                        </div>
                    </>
                );
                
            case 'etsy':
                return (
                    <>
                        <div className="mb-4">
                            <InputLabel htmlFor="shop_url" value="Etsy Shop Name" />
                            <TextInput
                                id="shop_url"
                                type="text"
                                name="shop_url"
                                value={data.shop_url}
                                className="mt-1 block w-full"
                                placeholder="YourEtsyShop"
                                onChange={(e) => setData('shop_url', e.target.value)}
                                required
                            />
                            <InputError message={errors.shop_url} className="mt-2" />
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="api_key" value="API Key" />
                            <TextInput
                                id="api_key"
                                type="text"
                                name="api_key"
                                value={data.api_key}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('api_key', e.target.value)}
                                required
                            />
                            <InputError message={errors.api_key} className="mt-2" />
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="api_secret" value="API Secret (leave blank to keep current)" />
                            <div className="relative">
                                <TextInput
                                    id="api_secret"
                                    type={showSecret ? "text" : "password"}
                                    name="api_secret"
                                    value={data.api_secret}
                                    className="mt-1 block w-full pr-10"
                                    onChange={(e) => setData('api_secret', e.target.value)}
                                    placeholder="Leave blank to keep current value"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-1"
                                    onClick={() => setShowSecret(!showSecret)}
                                >
                                    {showSecret ? (
                                        <svg className="h-6 w-6 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.api_secret} className="mt-2" />
                        </div>
                    </>
                );
                
            case 'amazon':
                return (
                    <>
                        <div className="mb-4">
                            <InputLabel htmlFor="shop_url" value="Amazon Seller ID" />
                            <TextInput
                                id="shop_url"
                                type="text"
                                name="shop_url"
                                value={data.shop_url}
                                className="mt-1 block w-full"
                                placeholder="Your Amazon Seller ID"
                                onChange={(e) => setData('shop_url', e.target.value)}
                                required
                            />
                            <InputError message={errors.shop_url} className="mt-2" />
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="api_key" value="Access Key ID" />
                            <TextInput
                                id="api_key"
                                type="text"
                                name="api_key"
                                value={data.api_key}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('api_key', e.target.value)}
                                required
                            />
                            <InputError message={errors.api_key} className="mt-2" />
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="api_secret" value="Secret Access Key (leave blank to keep current)" />
                            <div className="relative">
                                <TextInput
                                    id="api_secret"
                                    type={showSecret ? "text" : "password"}
                                    name="api_secret"
                                    value={data.api_secret}
                                    className="mt-1 block w-full pr-10"
                                    onChange={(e) => setData('api_secret', e.target.value)}
                                    placeholder="Leave blank to keep current value"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-1"
                                    onClick={() => setShowSecret(!showSecret)}
                                >
                                    {showSecret ? (
                                        <svg className="h-6 w-6 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.api_secret} className="mt-2" />
                        </div>
                    </>
                );
                
            default:
                return null;
        }
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Store Integration</h2>}
        >
            <Head title="Edit Store Integration" />
            
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Update Integration</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Update your e-commerce store integration details.
                                    </p>
                                </div>
                                
                                <div className="mb-4">
                                    <InputLabel htmlFor="name" value="Store Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter a name for this store integration"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                
                                <div className="mb-4">
                                    <InputLabel htmlFor="platform" value="Platform" />
                                    <select
                                        id="platform"
                                        name="platform"
                                        value={data.platform}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('platform', e.target.value)}
                                        required
                                        disabled // Platform cannot be changed after creation
                                    >
                                        <option value="shopify">Shopify</option>
                                        <option value="etsy">Etsy</option>
                                        <option value="amazon">Amazon</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Platform cannot be changed after creation. Create a new integration to use a different platform.
                                    </p>
                                    <InputError message={errors.platform} className="mt-2" />
                                </div>
                                
                                {renderPlatformFields()}
                                
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Active</span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Inactive integrations will not sync data automatically.
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-end mt-8 space-x-4">
                                    <Link
                                        href={route('store-integrations.show', storeIntegration.id)}
                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    {/* Danger Zone */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                        <div className="p-6 border-t-4 border-red-500">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Once you delete an integration, there is no going back. Please be certain.
                                </p>
                            </div>
                            
                            {!confirmingDeletion ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    onClick={confirmDeletion}
                                >
                                    Delete this integration
                                </button>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-700 mb-4">
                                        Are you sure you want to delete this integration? All products and sync logs associated with this integration will also be deleted. This action cannot be undone.
                                    </p>
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('store-integrations.destroy', storeIntegration.id)}
                                            method="delete"
                                            as="button"
                                            className="px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Yes, Delete Integration
                                        </Link>
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            onClick={cancelDeletion}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
