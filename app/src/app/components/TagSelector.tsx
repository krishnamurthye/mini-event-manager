// app/components/TagSelector.tsx
'use client';

import {useLazyQuery, useMutation} from '@apollo/client';
import {SEARCH_TAGS} from '../../graphql/event/queries';
import {CREATE_TAG} from '../../graphql/event/mutations';
import {Fragment, useEffect, useMemo, useState} from 'react';
import {Combobox} from '@headlessui/react';
import {CheckIcon, PlusIcon, XMarkIcon} from '@heroicons/react/20/solid';
import type {Tag} from '../../types';
import debounce from 'lodash.debounce';
import toast from "react-hot-toast";

interface FieldProps {
    field: {
        name: string;
        value: string[];
    };
    form: {
        setFieldValue: (field: string, value: string[]) => void;
    };
    initialTags?: Tag[];
}

export function TagSelector({field, form, initialTags = []}: FieldProps) {
    const [query, setQuery] = useState('');
    const [searchTags, {data, loading}] = useLazyQuery<{ searchTags: Tag[] }>(SEARCH_TAGS);
    const [createTag] = useMutation<{ createTag: Tag }, { label: string }>(CREATE_TAG);

    const selected = field.value || [];
    const [localTags, setLocalTags] = useState<Tag[]>(initialTags);

    const combinedTags = useMemo(() => {
        const tagMap = new Map<string, Tag>();
        for (const tag of [...(data?.searchTags || []), ...localTags]) {
            tagMap.set(tag.id, tag);
        }
        return Array.from(tagMap.values());
    }, [data?.searchTags, localTags]);


    const debouncedSearch = useMemo(() => {
        return debounce(async (q: string) => {
            try {
                await searchTags({variables: {query: q}});
            } catch (err) {
                console.error('Tag search failed:', err);
                toast.error('Tag search failed');
            }
        }, 300);
    }, [searchTags]);

    useEffect(() => {
        if (query.trim()) {
            // It is safe to ignore the promise and suppress warning
            void debouncedSearch(query);
        }
    }, [query, debouncedSearch]);

    const onSelectTag = (tagId: string) => {
        const updated = selected.includes(tagId)
            ? selected.filter((id) => id !== tagId)
            : [...selected, tagId];
        form.setFieldValue(field.name, updated);
        setQuery('');
    };

    const onCreateTag = async (label: string) => {
        try {
            const res = await createTag({variables: {label}});
            const newTag = res.data?.createTag;
            if (newTag) {
                setLocalTags((prev) => [...prev, newTag]);
                onSelectTag(newTag.id);
                setQuery('');
            }
        } catch (err) {
            console.error('Failed to create tag:', err);
            toast.error('Could not create tag. Please try again.');
        }
    };

    const showCreate = query.trim() && !combinedTags.some(t => t.label.toLowerCase() === query.trim().toLowerCase());

    return (
        <div className="relative">
            <Combobox value={selected} onChange={(val: string[]) => form.setFieldValue(field.name, val)} multiple>
                <div className="relative">
                    <Combobox.Input
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Search or create tags"
                        value={query}
                    />
                    <Combobox.Options
                        className="absolute z-10 bg-white border mt-1 rounded w-full shadow-lg max-h-60 overflow-auto">
                        {loading && <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>}

                        {combinedTags.map((tag) => (
                            <Combobox.Option key={tag.id} value={tag.id} as={Fragment}>
                                {({active, selected}) => (
                                    <li
                                        className={`cursor-pointer px-4 py-2 text-sm flex justify-between ${
                                            active ? 'bg-blue-500 text-white' : ''
                                        }`}
                                    >
                                        {tag.label}
                                        {selected && <CheckIcon className="w-4 h-4"/>}
                                    </li>
                                )}
                            </Combobox.Option>

                        ))}

                        {showCreate && (
                            <li
                                onClick={() => onCreateTag(query)}
                                className="cursor-pointer px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 flex items-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" /> {`Create "${query}"`}
                            </li>
                        )}
                    </Combobox.Options>
                </div>
            </Combobox>

            {/* Selected tags display */}
            <div className="flex flex-wrap gap-2 mt-2">
                {selected.map((id) => {
                    const tag = combinedTags.find(t => t.id === id);
                    return (
                        <span
                            key={id}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
              {tag?.label || id}
                            <XMarkIcon
                                className="ml-1 h-4 w-4 cursor-pointer hover:text-red-600"
                                onClick={() => onSelectTag(id)}
                            />
            </span>
                    );
                })}
            </div>
        </div>
    );
}
