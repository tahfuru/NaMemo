import { Platform } from 'react-native'
import * as SQLite from 'expo-sqlite'
import dayjs from 'dayjs'
import {
  RegisterTagMapProps,
  RegisterTagProps,
  RegisterWordProps,
} from './types'

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
  // create items (name database)
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS items (id TEXT, first_name TEXT, last_name TEXT NOT NULL, date DATE NOT NULL, affiliation TEXT NOT NULL, memo TEXT, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create table items (name database) success')
      },
      () => {
        console.log('create table items (name database) failed')
        return false
      }
    )
  })
  // create words (word database)
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS words (id TEXT, word TEXT NOT NULL, description TEXT NOT NULL, abbreviation TEXT, memo TEXT, date DATE, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create words (word database) success')
      },
      () => {
        console.log('create words (word database) failed')
        return false
      }
    )
  })
  // create tags (words' tag database)
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tags (id TEXT NOT NULL, tag TEXT NOT NULL, PRIMARY KEY(id))',
      [],
      () => {
        console.log('create tags (tag database) success')
      },
      () => {
        console.log('create tags (tag database) failed')
        return false
      }
    )
  })
  // create tag_map (mapping table for wordIDs and tagIDs)
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tag_map (id TEXT, word_id TEXT NOT NULL, tag_id TEXT NOT NULL, PRIMARY KEY(id))',
      [],
      () => {
        console.log(
          'create tag_map (mapping table for wordIDs and tagIDs) success'
        )
      },
      () => {
        console.log(
          'create tag_map (mapping table for wordIDs and tagIDs) failed'
        )
        return false
      }
    )
  })
  return db
}

const registerWord = (data: RegisterWordProps) => {
  const { wordId, word, description, abbreviation, memo, date, db } = data
  // submitされたデータをword_databaseに登録する
  db.transaction((word_tx) => {
    word_tx.executeSql(
      'INSERT INTO words (id, word, description, abbreviation, memo, date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        wordId,
        word,
        description,
        abbreviation,
        memo,
        dayjs(date).format('YYYY-MM-DD'),
      ],
      () => {
        console.log('insert words success')
      },
      () => {
        console.log('insert words failed')
        return false
      }
    )
    word_tx.executeSql('SELECT * FROM words', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    )
  })
}

const registerTag = (data: RegisterTagProps) => {
  const { tt_id, tag, db } = data
  console.log('inside registerTag')
  db.transaction((tt_tx) => {
    tt_tx.executeSql(
      'INSERT INTO tags (id, tag) VALUES (?, ?)',
      [tt_id, tag],
      () => {
        console.log('insert tags success')
      },
      () => {
        console.log('insert tags failed')
        return false
      }
    )
  })
}

const registerTagMap = (data: RegisterTagMapProps) => {
  const { map_id, word_id, tag_id, db } = data
  db.transaction((tmt_tx) => {
    tmt_tx.executeSql(
      'INSERT INTO tag_map (id, word_id, tag_id) VALUES (?, ?, ?)',
      [map_id, word_id, tag_id],
      () => {
        console.log('insert tag_map success')
      },
      () => {
        console.log('insert tag_map failed')
        return false
      }
    )
  })
}

export { getUniqueStr, openDatabase, registerWord, registerTag, registerTagMap }
