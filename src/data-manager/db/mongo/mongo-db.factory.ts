import {Db, MongoClient} from 'mongodb';
import {ConfigService} from '@nestjs/config';

export const mongoDbFactory = async (configService: ConfigService): Promise<Db> => {
  try {
    const client = await MongoClient.connect(configService.get('db.mongodb.url'));
    return client.db(configService.get('db.mongodb.dbName'), {});
  } catch (e) {
    throw e;
  }
};