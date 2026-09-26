import { DB_SCHEMA_QUERIES } from './schema';

export async function runDatabaseMigrations(db: any): Promise<void> {
  for (const q of DB_SCHEMA_QUERIES) {
    await db.execAsync(q);
  }
}
