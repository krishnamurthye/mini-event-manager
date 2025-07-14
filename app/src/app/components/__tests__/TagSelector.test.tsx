// TagSelector.test.tsx
import { fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MockedProvider} from '@apollo/client/testing';
import {TagSelector} from '../TagSelector';
import {SEARCH_TAGS} from '../../../graphql/event/queries';
import React from 'react';
import {CREATE_TAG} from "mini-event/graphql/event/mutations";
import toast from "react-hot-toast";

// Mock toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.useFakeTimers();
const mockField = {
    name: 'tags',
    value: [],
};

const mockForm = {
    setFieldValue: jest.fn(),
};

const searchMock = {
    request: {
        query: SEARCH_TAGS,
        variables: {query: 'Ne'},
    },
    result: {
        data: {
            searchTags: [{id: '2', label: 'Next.js'}],
        },
    },
};

beforeEach(() => {
    jest.clearAllMocks();
});

it('calls searchTags when typing', async () => {
    render(
        <MockedProvider mocks={[searchMock]} addTypename={false}>
            <TagSelector field={mockField} form={mockForm}/>
        </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/search or create tags/i), {
        target: {value: 'Ne'},
    });

    await waitFor(() => {
        expect(screen.getByText('Next.js')).toBeInTheDocument();
    });
});

const createMock = {
    request: {
    query: CREATE_TAG,
    variables: { label: 'NewTag' },
    },
    result: {
        data: {
      createTag: { id: '3', label: 'NewTag' },
        },
    },
};

it('calls createTag when creating a new tag', async () => {
    render(
        <MockedProvider mocks={[createMock]} addTypename={false}>
      <TagSelector field={mockField} form={mockForm} />
        </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/search or create tags/i), {
    target: { value: 'NewTag' },
    });

    await waitFor(() => {
        expect(screen.getByText(/create "NewTag"/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/create "NewTag"/i));

    await waitFor(() => {
        expect(mockForm.setFieldValue).toHaveBeenCalledWith('tags', ['3']);
    });
});

const errorMock = {
    request: {
        query: CREATE_TAG,
        variables: { label: 'FailTag' },
    },
    error: new Error('Create failed'),
};

it('shows error toast if createTag fails', async () => {
    render(
        <MockedProvider mocks={[errorMock]} addTypename={false}>
            <TagSelector field={mockField} form={mockForm} />
        </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/search or create tags/i), {
        target: { value: 'FailTag' },
    });

    await waitFor(() => {
        expect(screen.getByText(/create "FailTag"/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/create "FailTag"/i));

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Could not create tag. Please try again.');
    });
});
