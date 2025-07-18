import { ConfigService } from '@nestjs/config';
import { configDotenv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { JobPost } from './src/job-posts/entities/job-post.entity';
import { SeederOptions } from 'typeorm-extension';

configDotenv();

const config = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),

  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  entities: ['src/**/*.entity.ts'],
};

export const dataSource = new DataSource(options);
