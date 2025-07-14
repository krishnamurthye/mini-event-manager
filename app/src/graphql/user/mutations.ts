import {gql} from '@apollo/client';

export const REGISTER_USER = gql`
    mutation RegisterUser($name: String!, $email: String!, $password: String!) {
        registerUser(name: $name, email: $email, password: $password) {
            id
            personId
            createdAt
        }
    }
`;


