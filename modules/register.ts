import { Platform } from 'react-native'
import * as SQLite from 'expo-sqlite'

const getUniqueStr = (): string => {
  const strong = 1000
  return (
    new Date().getTime().toString(16) +
    Math.floor(strong * Math.random()).toString(16)
  )
}

const openDatabase = () => {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        }
      },
    }
  }
  const db = SQLite.openDatabase('db.db')
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS items (id text, first_name text, last_name text NOT NULL, date date NOT NULL, affiliation text NOT NULL, memo text, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create table success')
      },
      () => {
        console.log('create table failed')
        return false
      }
    )
  })
  return db
}

export { getUniqueStr, openDatabase }
