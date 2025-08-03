import { registerAs } from '@nestjs/config';
import { config as dotenvconfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvconfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mydb',
  entities: ['dist/**/*/.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  dropSchema: false,
  synchronize: true,
};

export default registerAs('typeorm', () => config);

const connectionSource = new DataSource(config as DataSourceOptions);
connectionSource
  .initialize()
  .then(() => console.log('Data Source initialized'))
  .catch((err) =>
    console.error('Error during Data Source initialization', err),
  );
