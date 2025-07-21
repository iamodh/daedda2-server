import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      // dto에 없는 속성 제거
      whitelist: true,
      // whitelist에 없는 속성 요청시 오류 응답
      forbidNonWhitelisted: true,
      // payload 자동 형 변환
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
