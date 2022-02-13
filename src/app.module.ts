import {Module} from '@nestjs/common';
import {DataManagerModule} from './data-manager/data-manager.module';
import {ConfigModule} from '@nestjs/config';
import configuration from './config/configuration';
import {StrategyRunnerModule} from './strategy-runner/strategy-runner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DataManagerModule,
    StrategyRunnerModule
  ]
})
export class AppModule {}
