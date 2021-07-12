import React, { useState, useEffect } from 'react'
import {
  Platform,
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
} from 'react-native'
import { Button } from 'react-native-elements'
import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'
import { useForm, Controller } from 'react-hook-form'

type KeywordData = {
  search: string
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

  console.log(FileSystem.documentDirectory + 'SQLite/')
  const db = SQLite.openDatabase('db.db')
  db.transaction((tx) => {
    tx.executeSql(
      'create table if not exists items (first_name text, last_name text, date date, affiliation text, memo text)',
      [],
      () => {
        console.log('create table success (openDatabase)')
      },
      () => {
        console.log('create table failed (openDatabase)')
        return false
      }
    )
  })
  return db
}

const db = openDatabase()

const listViewItemSeparator = () => {
  return (
    <View
      style={{
        height: 1,
        width: '100%',
        backgroundColor: '#413C58',
      }}
    />
  )
}

const ListView: React.VFC = () => {
  const { control, handleSubmit } = useForm<KeywordData>()
  const [dataList, setDataList] = useState<any>()
  const [empty, setEmpty] = useState(true)
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM items WHERE (`first_name` LIKE ? || "%" OR `last_name` LIKE ? || "%" OR `date` LIKE ? || "%" OR `affiliation` LIKE ? || "%" OR `memo` LIKE ? || "%")',
        [search, search, search, search, search],
        (_, resultSet) => {
          const temp = []
          for (let i = 0; i < resultSet.rows.length; ++i) {
            temp.push(resultSet.rows.item(i))
          }
          setDataList(temp)
          if (resultSet.rows.length >= 1) {
            setEmpty(false)
          } else {
            setEmpty(true)
          }
        },
        () => {
          console.log('search values failed (onSubmit)')
          return false
        }
      )
    })
  }, [search])

  const onSubmit = (data: KeywordData) => {
    const { search } = data
    setSearch(search)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control}
          rules={{
            required: false,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder='keyword'
            />
          )}
          name='search'
          defaultValue=''
        />
        <Button
          title='検索'
          onPress={handleSubmit(onSubmit)}
          titleStyle={styles.buttonSubmit}
          containerStyle={{
            margin: 10,
          }}
        />
      </View>
      <View style={styles.list}>
        {dataList && (
          <FlatList
            data={dataList}
            ItemSeparatorComponent={listViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View key={item.last_name} style={{ padding: 20 }}>
                <Text style={styles.item}> 姓: {item.last_name} </Text>
                <Text style={styles.item}> 名: {item.first_name} </Text>
                <Text style={styles.item}> 関係: {item.affiliation} </Text>
                <Text style={styles.item}> 日付: {item.date} </Text>
                <Text style={styles.item}> メモ: {item.memo} </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#59C3C3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: 'black',
    width: 200,
    padding: 10,
    borderRadius: 4,
    fontSize: 20,
    margin: 10,
  },
  buttonSubmit: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    flex: 7,
  },
  item: {
    backgroundColor: '#EBEBEB',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 4,
  },
  title: {
    fontSize: 32,
  },
})

export default ListView
