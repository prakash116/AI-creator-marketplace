export type DbMode = 'mongodb' | 'memory';

/** Exposes which storage backend is active. Provided by DatabaseModule. */
export class DatabaseService {
  constructor(public readonly mode: DbMode) {}

  get isMongo(): boolean {
    return this.mode === 'mongodb';
  }
}
