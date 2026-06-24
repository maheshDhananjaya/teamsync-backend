import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Cross-Origin Resource Sharing (CORS) so our Next.js web app can make API requests
  app.enableCors({
    origin: '*', // In production, replace with specific domain limits
    credentials: true,
  });

  // 2. Set up the Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip out property parameters that aren't declared in our DTOs
      transform: true, // Automatically convert query strings and parameters into their target typed objects
      forbidNonWhitelisted: false,
    }),
  );

  // 3. Bind our uniform Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 4. Configure Swagger API Documentation (Part F Demonstration Requirement)
  const config = new DocumentBuilder()
    .setTitle('TeamSync API Engine')
    .setDescription(
      'Core architectural backend endpoints managing projects, roles, and real-time task management workflows.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Enter your valid JWT access token here to authenticate secure operations.',
        in: 'header',
      },
      'JWT-auth', // Reference key used by route decorators later
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Start our service engine
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `TeamSync backend engine successfully launched on: http://localhost:${port}`,
  );
  console.log(
    `Dynamic Swagger Open-API interface active at: http://localhost:${port}/api/docs\n`,
  );
}
bootstrap();
