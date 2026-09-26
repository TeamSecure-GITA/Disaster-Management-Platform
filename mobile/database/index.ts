import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from './schema';
import { runDatabaseMigrations } from './migrations';
import { Platform } from 'react-native';

let dbInstance: any = null;

export async function getDatabase() {
  if (Platform.OS === 'web') {
    return {
      execAsync: async () => {},
      runAsync: async () => {},
      getAllAsync: async () => [],
      getFirstAsync: async () => null,
    };
  }
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await runDatabaseMigrations(dbInstance);
  }
  return dbInstance;
}
