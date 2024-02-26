import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite/next';

import { Category, Transaction } from './types';

export const loadDatabase = async () => {
  const dbName = 'mySQLiteDB.db';
  const dbAsset = require('../assets/mySQLiteDB.db');
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite', {
      intermediates: true,
    });
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
  const db = await SQLite.openDatabaseAsync(dbName);
  await createCategoriesTable(db);
  await createTransactionsTable(db);
};

const createCategoriesTable = async (db: SQLite.SQLiteDatabase) =>
  await db.execAsync(`CREATE TABLE IF NOT EXISTS Categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income'))
);`);
const createTransactionsTable = async (db: SQLite.SQLiteDatabase) =>
  await db.execAsync(`CREATE TABLE IF NOT EXISTS Transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  amount REAL NOT NULL,
  date INTEGER NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
  FOREIGN KEY (category_id) REFERENCES Categories (id)
 );`);

export const getCategories = async (db: SQLite.SQLiteDatabase) =>
  await db.getAllAsync<Category>(`SELECT * FROM Categories;`);

export const getOrderedTransactions = async (db: SQLite.SQLiteDatabase) =>
  await db.getAllAsync<Transaction>(`SELECT * FROM Transactions ORDER BY date DESC;`);
