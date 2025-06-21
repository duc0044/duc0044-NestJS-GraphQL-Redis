import { registerAs } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export const graphqlConfig = registerAs(
  'graphql',
  (): ApolloDriverConfig => ({
    driver: ApolloDriver,
    autoSchemaFile: 'schema.gql',
    playground: false,
    debug: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
    sortSchema: true,
    subscriptions: { 'graphql-ws': true },
  }),
);
