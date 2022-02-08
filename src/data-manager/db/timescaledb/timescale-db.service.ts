import {Inject, Injectable} from '@nestjs/common';
import {Client, Pool, QueryResult} from 'pg';
import {Symbol} from '../../../model/symbol';
import {DateTime, Duration} from 'luxon';
import {Candle} from '../../../model/candle';
import {formatString} from '../../../util/string-utils';

@Injectable()
export class TimescaleDbService {
  SQL_CREATE_EXTENSION: string = 'CREATE EXTENSION IF NOT EXISTS timescaledb;';
  SQL_GET_LATEST_TIMESTAMP = 'SELECT (EXTRACT(EPOCH FROM timestamp) * 1000)::BIGINT FROM {0} ORDER BY timestamp DESC LIMIT 1'

  constructor(@Inject('TIMESCALE_DB_POOL') private pool: Pool) {
    this.initializeDb();
  }

  /**
   * Saves the given candles in the DB. First, checks whether a table for the given symbol and duration exists. If not, creates a new table.
   * @param symbol
   * @param duration
   * @param candles
   */
  public saveCandles(symbol: Symbol, duration: Duration, candles: Candle[]): Promise<void> {
    return this.tableExists(symbol, duration).then(exists => {
      let tableCreatePromise: Promise<any> = this.createTableForSymbol(symbol, duration);
      if (exists) {
        tableCreatePromise = Promise.resolve();
      }
      return tableCreatePromise.then(() => {
        this.pool.query(this.getCandleInsertSql(this.getTableName(symbol, duration), candles));
      }).catch(error => {
        console.error(error);
      })
    });
  }

  /**
   * Gets the timestamp of the latest record for the given symbol and duration
   * @param symbol
   * @param duration
   */
  public getLatestTimestamp(symbol: Symbol, duration: Duration): Promise<DateTime> {
      const query: string = formatString(this.SQL_GET_LATEST_TIMESTAMP, this.getTableName(symbol, duration));
      return this.pool.query(query).then(response => {
        return DateTime.fromMillis(Number(response.rows[0].int8));
      }).catch(error => {
        console.error(error);
        return null;
      })
  }

  /**
   * Checks whether a table for the given symbol and duration exists already
   * @param symbol
   * @param duration
   * @private
   */
  private tableExists(symbol: Symbol, duration: Duration): Promise<boolean> {
    return this.tableExistsByName(this.getTableName(symbol, duration));
  }

  /**
   * Checks whether a table with the given name exists already
   * @param tableName
   * @private
   */
  private tableExistsByName(tableName: string): Promise<boolean> {
    const selectQuery: string = `
        SELECT EXISTS(
                       SELECT
                       FROM pg_tables
                       WHERE schemaname = 'public'
                         AND tablename = '${tableName}'
                   );
    `;
    return this.pool.query(selectQuery)
    .then(response => {
      return response.rows[0].exists;
    })
    .catch(error => {
      console.log(error);
      // TODO proper error handling
      return false;
    });
  }

  /**
   * Generates a bulk insert SQL for the given candles.
   * @param tableName
   * @param candles
   * @private
   */
  private getCandleInsertSql(tableName: string, candles: Candle[]): string {
    const values: string = candles.map(candle =>
      `('${candle.timestamp.toISO()}',  ${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume})`
    ).join(',') + ';';
    let sql: string = `INSERT INTO ${tableName} VALUES ${values}`;
    return sql;
  }

  /**
   * Creates a table in the DB for the given symbol and duration
   * @param symbol
   * @param duration
   * @private
   */
  private createTableForSymbol(symbol: Symbol, duration: Duration): Promise<QueryResult> {
    const tableCreateQuery: string = `
        CREATE TABLE IF NOT EXISTS ${this.getTableName(symbol, duration)}
        (
            timestamp TIMESTAMPTZ NOT NULL PRIMARY KEY,
            open NUMERIC NOT NULL,
            close NUMERIC NOT NULL,
            high NUMERIC NOT NULL,
            low NUMERIC NOT NULL,
            volume NUMERIC NOT NULL
        );
    `;
    return this.pool.query(tableCreateQuery);
  }

  /**
   * Gets table name for the given symbol and duration. It concatenates the symbol name and duration
   * @param symbol
   * @param duration
   * @private
   */
  private getTableName(symbol: Symbol, duration: Duration): string {
    return `${symbol.getName()}${duration.toISO()}`.toLowerCase();
  }

  /**
   * Adds timescale db extension to the DB
   */
  initializeDb(): void {
    const client: Client = this.getClient();
    client.query(this.SQL_CREATE_EXTENSION)
    .then((e) => {
      console.log('Added timescaledb extension');
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      client.end();
    });
  }

  private getClient(): Client {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'password',
      port: 5432
    });
    return client;
  }
}