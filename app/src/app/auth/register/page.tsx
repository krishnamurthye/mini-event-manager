'use client';

import {ApolloError, useMutation} from '@apollo/client';
import {REGISTER_USER} from 'mini-event/graphql/user/mutations';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {toast} from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [registerUser] = useMutation(REGISTER_USER);
    const [errorMsg, setErrorMsg] = useState('');

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Register</h1>

            <Formik
                initialValues={{name: '', email: '', password: ''}}
                validationSchema={Yup.object({
                    name: Yup.string().required('Required'),
                    email: Yup.string().email('Invalid email').required('Required'),
                    password: Yup.string().min(4).required('Required'),
                })}
                onSubmit={async (values, {setSubmitting}) => {
                    setErrorMsg('');
                    try {
                        await registerUser({variables: values});
                        toast.success('Registration successful!');
                        router.push('/auth/login');
                    } catch (err: ApolloError | Error | unknown) {
                        const msg = (err instanceof Error || err instanceof ApolloError ) ? err.message : 'Registration failed';
                        setErrorMsg(msg);
                        toast.error(msg);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({isSubmitting}) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block">Name</label>
                            <Field id="name" name="name" className="w-full border px-2 py-1 rounded"/>
                            <ErrorMessage name="name" component="p" className="text-red-500 text-sm"/>
                        </div>
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
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
