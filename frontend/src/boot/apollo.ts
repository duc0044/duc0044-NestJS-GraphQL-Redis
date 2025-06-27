import { boot } from 'quasar/wrappers';
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { DefaultApolloClient } from '@vue/apollo-composable';

// 1. Tạo HTTP Link tới GraphQL server
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

// 2. Thêm Authorization Header nếu có token
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 3. Tạo Apollo Client
const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

// 4. Gắn vào Vue App
export default boot(({ app }) => {
  app.provide(DefaultApolloClient, apolloClient);
});
