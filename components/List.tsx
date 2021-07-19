import React, { useState, useEffect } from 'react'
import {
  Platform,
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Button, Card, ListItem } from 'react-native-elements'
import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'
import { useForm, Controller } from 'react-hook-form'
import Icon from '@expo/vector-icons/MaterialIcons'
import { DetailsScreenNavigationProp } from './types'

type KeywordData = {
  search: string
}

type ItemProps = {
  first_name?: string
  last_name: string
  date: Date
  affiliation?: string
  memo?: string
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
      'CREATE TABLE IF NOT EXISTS items (first_name text, last_name text NOT NULL, date date NOT NULL, affiliation text NOT NULL, memo text, PRIMARY KEY(last_name, date))',
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

const List: React.VFC = () => {
  const { control, handleSubmit } = useForm<KeywordData>()
  const [dataList, setDataList] = useState<ItemProps[]>()
  const [empty, setEmpty] = useState(true)
  const [search, setSearch] = useState<string>('')
  const navigation = useNavigation<DetailsScreenNavigationProp>()

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM items WHERE (`first_name` LIKE ? || "%" OR `last_name` LIKE ? || "%" OR `date` LIKE ? || "%" OR `affiliation` LIKE ? || "%" OR `memo` LIKE ? || "%")',
        [search, search, search, search, search],
        (_, resultSet) => {
          const temp: ItemProps[] = []
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
        {dataList ? (
          dataList.length > 0 && (
            <Card containerStyle={{ width: '100%', borderRadius: 4 }}>
              <FlatList
                data={dataList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }: { item: ItemProps }) => (
                  <View>
                    <ListItem
                      key={item.last_name}
                      style={{
                        height: 64,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      onPress={() => navigation.navigate('Details', item)}>
                      <ListItem.Content
                        style={{ flex: 9, justifyContent: 'center' }}>
                        <ListItem.Title
                          style={{
                            fontSize: 24,
                          }}>{`${item.last_name} ${item.first_name}`}</ListItem.Title>
                        <ListItem.Subtitle style={{ color: 'grey' }}>
                          {`${item.affiliation}`}
                        </ListItem.Subtitle>
                      </ListItem.Content>
                      <Icon name='chevron-right' size={32} color='grey' />
                    </ListItem>
                    <Card.Divider />
                  </View>
                )}
              />
            </Card>
          )
        ) : (
          <></>
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
    width: '100%',
    padding: 10,
    alignItems: 'center',
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

export default List
