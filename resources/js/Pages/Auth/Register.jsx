import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Join Texporta today! ✨</h2>
                <p className="text-gray-600 mt-1">Take control of your multi-store inventory in minutes</p>
            </div>

            <form onSubmit={submit}>
                <div className="space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Full name" className="text-gray-700" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            autoComplete="name"
                            placeholder="John Doe"
                            isFocused={true}
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

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
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-gray-700" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                        <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm password" className="text-gray-700" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div>
                        <PrimaryButton 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
                            disabled={processing}
                        >
                            {processing ? 'Creating account...' : 'Create account'}
                        </PrimaryButton>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Already have a Texporta account?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Sign in
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Welcome back! Your inventory dashboard is just a click away. 🚀
                        </p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
