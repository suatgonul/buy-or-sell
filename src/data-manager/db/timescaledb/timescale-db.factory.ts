import {Pool} from 'pg';
import {ConfigService} from '@nestjs/config';

export const timescaleDbFactory = async (configService: ConfigService) => {
  return new Pool({
    user: configService.get('db.timescaledb.user'),
    host: configService.get('db.timescaledb.host'),
    database: configService.get('db.timescaledb.dbName'),
    password: configService.get('db.timescaledb.password'),
    port: configService.get('db.timescaledb.port'),
  });
};
