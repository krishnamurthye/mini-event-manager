'use client';

import {ErrorMessage, Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import {TagSelector} from './TagSelector';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    date: Yup.string()
        .required('Date is required')
        .test('is-valid-date', 'Invalid date', val => !isNaN(Date.parse(val || ''))),
    tagIds: Yup.array().of(Yup.string()),
});

type EventFormProps = {
    initialValues: {
        title: string;
        date: string;
        tagIds: string[];
    };
    initialTags?: { id: string; label: string }[];
    onSubmit: (values: { title: string; date: string; tagIds: string[] }) => Promise<void>;
    loading?: boolean;
    mode?: 'create' | 'edit';
};

export default function EventForm({initialValues, onSubmit, loading, mode = 'create', initialTags}: EventFormProps) {

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">
                {mode === 'create' ? 'Create New Event' : 'Edit Event'}
            </h1>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, {setSubmitting}) => {
                    // console.log('Submitting values:', values); // <-- add this
                    await onSubmit(values);
                    setSubmitting(false);
                }}
            >
                {({isSubmitting}) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block mb-1 font-semibold">Title</label>
                            <Field
                                id="title"
                                name="title"
                                className="w-full border px-3 py-2 rounded"
                                placeholder="Event title"
                            />
                            <ErrorMessage name="title" component="p" className="text-red-500 text-sm"/>
                        </div>

                        <div>
                            <label htmlFor="date" className="block mb-1 font-semibold">Date</label>
                            <Field
                                id="date"
                                name="date"
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full border px-3 py-2 rounded"
                            />
                            <ErrorMessage name="date" component="p" className="text-red-500 text-sm"/>
                        </div>

                        <div>
                            <label htmlFor="tagIds" className="block mb-1 font-semibold">Tags</label>
                            <Field id="tagIds" name="tagIds" component={TagSelector} initialTags={initialTags}/>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting
                                ? mode === 'create'
                                    ? 'Creating...'
                                    : 'Saving...'
                                : mode === 'create'
                                    ? 'Create Event'
                                    : 'Update Event'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
