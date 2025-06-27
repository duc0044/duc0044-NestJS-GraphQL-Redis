import { registerAs } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import type { ValidationError } from '@nestjs/common';

export const graphqlConfig = registerAs(
  'graphql',
  (): ApolloDriverConfig => ({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    playground: false,
    debug: false,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
    sortSchema: true,
    subscriptions: { 'graphql-ws': true },
    context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
    formatError: (error: GraphQLError): GraphQLFormattedError => {
      const invalidArgs = (
        error.extensions as { invalidArgs?: ValidationError[] }
      )?.invalidArgs;

      if (error.message === 'Validation failed' && Array.isArray(invalidArgs)) {
        const fields = invalidArgs.map((err) => ({
          field: err.property,
          messages: Object.values(err.constraints || {}),
        }));

        return {
          message: 'Validation failed',
          extensions: {
            code: 'VALIDATION_ERROR',
            fields,
          },
        };
      }

      return {
        message: error.message,
        extensions: {
          ...error.extensions,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        },
      };
    },
  }),
);
