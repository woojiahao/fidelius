import { openDB, type IDBPDatabase } from 'idb'

export default class Storage<T> {
  private readonly db: Promise<IDBPDatabase<unknown>>
  private readonly storeName: string

  constructor(databaseName: string, storeName: string) {
    this.storeName = storeName
    this.db = openDB(databaseName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
  }

  protected async load(queryName: string): Promise<T | null> {
    return (await (await this.db).get(this.storeName, queryName)) as T | null
  }

  protected async save(queryName: string, data: T) {
    await (await this.db).put(this.storeName, data, queryName)
  }

  protected async delete(queryName: string) {
    await (await this.db).delete(this.storeName, queryName)
  }
}
