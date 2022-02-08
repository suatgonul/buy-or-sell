import {Module} from '@nestjs/common';
import {DataManagerModule} from './data-manager/data-manager.module';
import {ConfigModule} from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DataManagerModule
  ]
})
export class AppModule {}
