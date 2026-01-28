import pool from '../src/db/connection';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration...\n');
    
    const sqlPath = path.join(__dirname, '001_add_task_categorization.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query('BEGIN');
    
    // Remove comments and split by semicolon
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    let counter = 0;
    for (const statement of statements) {
      counter++;
      console.log(`[${counter}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
      await client.query(statement);
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify changes
    const result = await client.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'prjmng3' 
        AND table_name IN ('tasks', 'functions')
      ORDER BY table_name, ordinal_position
    `);
    
    console.log('\n📊 Updated schema:');
    console.table(result.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
