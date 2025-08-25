import { ConfigService } from '@nestjs/config';
import { configDotenv } from 'dotenv';
import { DataSource } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';
import type { DataSourceOptions } from 'typeorm';

configDotenv();

const config = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_DATABASE'),

  seeds: ['src/database/seeds/index.seeder.ts'],
  entities: ['src/**/*.entity.ts'],
};

export const dataSource = new DataSource(options);
