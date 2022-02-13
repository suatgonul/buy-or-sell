import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {timescaleDbFactory} from './db/timescaledb/timescale-db.factory';
import {mongoDbFactory} from './db/mongo/mongo-db.factory';
import {BitstampDataIntegrator} from './data-integration/bitstamp-data-integrator.service';
import {DataIntegrationController} from './controller/data-integration.controller';
import {TimescaleDbService} from './db/timescaledb/timescale-db.service';
import {DataCollectorService} from './data-collector.service';
import {DataManagerService} from './data-manager.service';

@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    {
      provide: 'MONGO_DB_CLIENT',
      inject: [ConfigService],
      useFactory: mongoDbFactory
    },
    {
      provide: 'TIMESCALE_DB_POOL',
      inject: [ConfigService],
      useFactory: timescaleDbFactory
    },
    TimescaleDbService,
    BitstampDataIntegrator,
    DataCollectorService,
    DataManagerService
  ],
  controllers: [
    DataIntegrationController
  ],
  exports: [
    BitstampDataIntegrator,
    TimescaleDbService,
    DataCollectorService,
    DataManagerService
  ]
})
export class DataManagerModule {
}
