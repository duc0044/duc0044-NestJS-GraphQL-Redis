- NestJS API: http://localhost:3000"
- GraphQL Playground: http://localhost:3000/graphql"
- phpMyAdmin: http://localhost:8080"
- Redis Commander: http://localhost:8081"

<!-- fe bat loi -->

if (error.extensions?.code === 'VALIDATION_ERROR') {
error.extensions.fields.forEach(({ field, messages }) => {
formErrors[field] = messages.join(', ');
});
}
