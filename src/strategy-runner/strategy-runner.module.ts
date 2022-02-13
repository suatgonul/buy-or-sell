import {Module} from '@nestjs/common';
import {StrategyRunnerService} from './strategy-runner.service';
import {StrategyRunnerController} from './controller/strategy-runner.controller';
import {DataManagerModule} from '../data-manager/data-manager.module';

@Module({
  imports: [
    DataManagerModule
  ],
  providers: [
    StrategyRunnerService
  ],
  controllers: [
    StrategyRunnerController
  ]
})
export class StrategyRunnerModule {
}
