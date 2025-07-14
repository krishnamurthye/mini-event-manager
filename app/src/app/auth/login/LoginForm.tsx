// app/auth/login/LoginForm.tsx
'use client';

import {useMutation} from '@apollo/client';
import {LOGIN_USER} from 'mini-event/graphql/auth/mutations';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {useAuthStore} from 'mini-event/lib/store/authStore';
import {toast} from 'react-hot-toast';

export default function LoginForm() {
    const router = useRouter();
    const [loginUser] = useMutation(LOGIN_USER);
    const [errorMsg, setErrorMsg] = useState('');

    return (
        <Formik
            initialValues={{email: '', password: ''}}
            validationSchema={Yup.object({
                email: Yup.string().email('Invalid email').required('Required'),
                password: Yup.string().required('Required'),
            })}
            onSubmit={async (values, {setSubmitting}) => {
                setErrorMsg('');
                try {
                    const {data} = await loginUser({variables: values});
                    const token = data.loginUser.token;
                    const userId = data.loginUser.user.id;

                    if (!token || !userId) {
                        throw new Error('Invalid login response. Please try again.');
                    }
                    localStorage.setItem('token', token)
                    useAuthStore.getState().login(token, userId);
                    toast.success('Login successful.');
                    router.push('/events');
                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Login failed';
                    setErrorMsg(msg);
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({isSubmitting}) => (
                <Form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block">Email</label>
                        <Field id="email" name="email" type="email" className="w-full border px-2 py-1 rounded"/>
                        <ErrorMessage name="email" component="p" className="text-red-500 text-sm"/>
                    </div>

                    <div>
                        <label htmlFor="password" className="block">Password</label>
                        <Field id="password" name="password" type="password"
                               className="w-full border px-2 py-1 rounded"/>
                        <ErrorMessage name="password" component="p" className="text-red-500 text-sm"/>
                    </div>

                    {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </Form>
            )}
        </Formik>
    );
}
