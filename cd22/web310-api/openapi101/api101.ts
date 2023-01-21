//
// https://github.com/colinhacks/zod
// https://github.com/asteasolutions/zod-to-openapi
//
import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";
import {
    OpenAPIRegistry,
    OpenAPIGenerator,
    extendZodWithOpenApi,
} from 'https://esm.sh/@asteasolutions/zod-to-openapi@2.3.0';
extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
// Register definitions here
const UserSchema = registry.register(
    'User',
    z.object({
        id: z.string().openapi({ example: '12dddrrrsxx' }),
        name: z.string().openapi({ example: 'John Doe' }),
        age: z.number().openapi({ example: 42 }),
    })
);
registry.registerPath({
    method: 'get',
    path: '/users/{id}',
    description: 'Get user data by its id',
    summary: 'Get a single user',
    request: {
        params: z.object({
            id: z.string().openapi({ example: '1212121' }),
        }),
    },
    responses: {
        200: {
            description: 'Object with user data.',
            content: {
                'application/json': {
                    schema: UserSchema,
                },
            },
        },
        204: {
            description: 'No content - successful operation',
        },
    },
});

const generator = new OpenAPIGenerator(registry.definitions, '3.0.0');
const doc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: '1.0.0',
      title: '2022-1104 My API',
      description: 'This is the API',
    },
    servers: [{ url: 'v1' }],
  });
console.log(JSON.stringify(doc))
