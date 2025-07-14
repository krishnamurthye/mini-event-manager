import {DocumentNode, MutationHookOptions, useMutation} from '@apollo/client';

export function useSafeMutation<TData, TVariables>(
    mutation: DocumentNode,
    options?: MutationHookOptions<TData, TVariables>
) {
    return useMutation<TData, TVariables>(mutation, {
        ...options,
        onError: (error) => {
            // Only handle domain-specific errors here if needed
            if (options?.onError) {
                options.onError(error);
            }
        },
    });
}
