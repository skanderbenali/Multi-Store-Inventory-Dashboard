import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Texporta! 👋</h2>
                <p className="text-gray-600 mt-1">Your all-in-one inventory command center awaits</p>
            </div>

            {status && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{status}</div>}

            <form onSubmit={submit}>
                <div className="space-y-5">
                    <div>
                        <InputLabel htmlFor="email" value="Email address" className="text-gray-700" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            autoComplete="username"
                            placeholder="your.email@example.com"
                            isFocused={true}
                            onChange={handleOnChange}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="password" value="Password" className="text-gray-700" />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={handleOnChange}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox 
                                name="remember" 
                                value={data.remember} 
                                onChange={handleOnChange} 
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                    </div>

                    <div>
                        <PrimaryButton 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </PrimaryButton>
                    </div>
                    
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            New to Texporta?{' '}
                            <Link
                                href={route('register')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Create an account
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Join thousands of merchants managing their inventory across multiple platforms. ✨
                        </p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
