import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:9000',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });
  // app.use(
  //   graphqlUploadExpress({
  //     maxFileSize: 10000000000,
  //     maxFiles: 1,
  //   }),
  // );
  try {
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
