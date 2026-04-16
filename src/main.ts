import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`Credit origination service running on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Bootstrap error', error);
  process.exit(1);
});
