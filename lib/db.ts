import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { SQLiteDatabase } from 'expo-sqlite/next';

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
};

export const getCategories = async (db: SQLiteDatabase) =>
  await db.getAllAsync<Category>(`SELECT * FROM Categories;`);

export const getOrderedTransactions = async (db: SQLiteDatabase) =>
  await db.getAllAsync<Transaction>(`SELECT * FROM Transactions ORDER BY date DESC;`);
