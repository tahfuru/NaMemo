import { Platform } from 'react-native'
import * as SQLite from 'expo-sqlite'

const getUniqueStr = (key: string): string => {
  const strong = 1000
  return (
    key +
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
      'CREATE TABLE IF NOT EXISTS items (id TEXT, first_name TEXT, last_name TEXT NOT NULL, date DATE NOT NULL, affiliation TEXT NOT NULL, memo TEXT, PRIMARY KEY(id))',
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

const openWordDatabase = () => {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        }
      },
    }
  }
  const db = SQLite.openDatabase('words.db')
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS words (id TEXT, word TEXT NOT NULL, description TEXT NOT NULL, abbreviation TEXT, memo TEXT, date DATE, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create word table success')
      },
      () => {
        console.log('create word table failed')
        return false
      }
    )
  })
  return db
}

const openTagTable = () => {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        }
      },
    }
  }
  const db = SQLite.openDatabase('tags.db')
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tags (id TEXT NOT NULL, tag TEXT NOT NULL, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create tag table success')
      },
      () => {
        console.log('create tag table failed')
        return false
      }
    )
  })
  return db
}

const openTagMapTable = () => {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        }
      },
    }
  }
  const db = SQLite.openDatabase('tag_map.db')
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tag_map (id TEXT, word_id TEXT NOT NULL, tag_id TEXT NOT NULL, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create tag_map table success')
      },
      () => {
        console.log('create tag_map table failed')
        return false
      }
    )
  })
  return db
}

export {
  getUniqueStr,
  openDatabase,
  openWordDatabase,
  openTagTable,
  openTagMapTable,
}
