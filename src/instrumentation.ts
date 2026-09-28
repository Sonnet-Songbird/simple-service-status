export async function register(): Promise<void> {
  const { runMigrations } = await import('./db/migrate')
  runMigrations()
}
