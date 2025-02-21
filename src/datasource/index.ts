import configLoader from '../config/loader.js';
import getLogger from '../utils/logger.js';
import { type DataSource } from './datasource.js';
import BigQuerySource from './datasources/bigquery.js';
import MysqlSource from './datasources/mysql.js';
import { PgsqlSource } from './datasources/pgsql.js';

const databases = process.env.DATABASES != null ? process.env.DATABASES.split(',') : [];
const tables = process.env.TABLES != null ? process.env.TABLES.split(',') : [];

const logger = getLogger('DataSourceLoader');
export default function loadDataSource(): DataSource {
  if (configLoader.getBqKey() == null && process.env.DB_CONNECTION == null) {
    throw new Error('Both BQ_KEY and DB_CONNECTION are set. Please set only one of them.');
  }

  let dataSource: DataSource;
  if (process.env.DB_CONNECTION != null) {
    if (process.env.DB_CONNECTION.startsWith('mysql')) {
      dataSource = new MysqlSource(process.env.DB_CONNECTION!, databases, tables);
    } else if (process.env.DB_CONNECTION.startsWith('pgsql') || process.env.DB_CONNECTION.startsWith('postgres')) {
      dataSource = new PgsqlSource(process.env.DB_CONNECTION!, databases, tables);
    } else {
      throw new Error('Unsupported DB_CONNECTION: ' + process.env.DB_CONNECTION);
    }
  } else {
    dataSource = new BigQuerySource(configLoader.getBqKey()!, databases, tables);
  }

  logger.info(`Use data source from ${dataSource.dataSourceType}`);
  return dataSource;
}
