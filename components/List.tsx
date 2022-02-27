import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  StyleSheet,
  FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Button, Card, ListItem } from 'react-native-elements'
import { useForm, Controller } from 'react-hook-form'
import Icon from '@expo/vector-icons/MaterialIcons'

import { DetailsScreenNavigationProp } from '../modules/types'
import {
  openDatabase,
  openWordDatabase,
  openTagMapTable,
  openTagTable,
} from '../modules/register'

type KeywordData = {
  keyword: string
}

type NameItemProps = {
  id: string
  first_name?: string
  last_name: string
  date: Date
  affiliation?: string
  memo?: string
}

type WordItemProps = {
  id: string
  word: string
  description?: string
  abbreviation?: string
  memo?: string
  date?: Date
}

type TagItemProps = {
  id: string
  tag: string
}

type KeywordProps = {
  isModeSelected: boolean
  keyword: string
}

// 検索モード
const modeList = ['名前', '用語', 'タグ']

// データベース
const ndb = openDatabase()
const wdb = openWordDatabase()
const tmt = openTagMapTable()
const tt = openTagTable()

const List = () => {
  const { control, handleSubmit } = useForm<KeywordData>()
  const [nameList, setNameList] = useState<NameItemProps[]>()
  const [wordList, setWordList] = useState<WordItemProps[]>()
  const [tagList, setTagList] = useState<TagItemProps[]>()
  const [empty, setEmpty] = useState(true)
  const [mode, setMode] = useState<number>(0)
  const [modeName, setModeToName] = useState<KeywordProps>({
    isModeSelected: true,
    keyword: '',
  })
  const [modeWord, setModeToWord] = useState<KeywordProps>({
    isModeSelected: true,
    keyword: '',
  })
  const [modeTag, setModeToTag] = useState<KeywordProps>({
    isModeSelected: true,
    keyword: '',
  })
  const navigation = useNavigation<DetailsScreenNavigationProp>()

  // 検索モードstateの変更
  useEffect(() => {
    if (mode % 3 === 0) {
      setModeToName({ isModeSelected: true, keyword: modeName.keyword })
      setModeToWord({ isModeSelected: false, keyword: modeWord.keyword })
      setModeToTag({ isModeSelected: false, keyword: modeTag.keyword })
    } else if (mode % 3 === 1) {
      setModeToName({ isModeSelected: false, keyword: modeName.keyword })
      setModeToWord({ isModeSelected: true, keyword: modeWord.keyword })
      setModeToTag({ isModeSelected: false, keyword: modeTag.keyword })
    } else if (mode % 3 === 2) {
      setModeToName({ isModeSelected: false, keyword: modeName.keyword })
      setModeToWord({ isModeSelected: false, keyword: modeWord.keyword })
      setModeToTag({ isModeSelected: true, keyword: modeTag.keyword })
    }
  }, [mode])

  // 人物モードの検索処理
  useEffect(() => {
    const keyword = modeName.keyword
    ndb.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM items WHERE (`first_name` LIKE ? || "%" OR `last_name` LIKE ? || "%" OR `date` LIKE ? || "%" OR `affiliation` LIKE ? || "%" OR `memo` LIKE ? || "%")',
        [keyword, keyword, keyword, keyword, keyword],
        (_, resultSet) => {
          const temp: NameItemProps[] = []
          for (let i = 0; i < resultSet.rows.length; i++) {
            temp.push(resultSet.rows.item(i))
          }
          setNameList(temp)
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
    }),
      [modeName]
  })

  // 用語モードの検索処理
  useEffect(() => {
    const temp: WordItemProps[] = []
    const keyword = modeWord.keyword

    // tag_tableから用語の検索
    wdb.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM words WHERE (`word` LIKE ? || "%" OR `description` LIKE ? || "%" OR `abbreviation` LIKE ? || "%" OR `memo` LIKE ? || "%" OR `date` LIKE ? || "%")',
        [keyword, keyword, keyword, keyword, keyword],
        (_, resultSet) => {
          for (let i = 0; i < resultSet.rows.length; i++) {
            temp.push(resultSet.rows.item(i))
          }
          console.log('aaaaaa')
          console.log(temp)
          // stateで検索ヒットした用語の保持
          setWordList(temp)
          if (resultSet.rows.length >= 1) {
            setEmpty(false)
          } else {
            setEmpty(true)
          }
        },
        () => {
          console.log('search values failed (word_database)')
          return false
        }
      )
    })
  }, [modeWord])

  useEffect(() => {
    if (wordList !== undefined) {
      console.log('wordlist')
      console.log(wordList)
      // 検索ヒットした全ての用語に対してタグを取得するためにtag_map_tableから登録されているtagIDを取得
      for (let i = 0; i < wordList.length; i++) {
        tmt.transaction((tmt_tx) => {
          tmt_tx.executeSql(
            'SELECT * FROM tag_map WHERE (`word_id` LIKE ? || "%")',
            [wordList[i].id],
            (_, tmtResultSet) => {
              console.log('tmtResultSet')
              console.log(tmtResultSet)
            },
            () => {
              console.log('search tagID failed (tag_map_table)')
              return false
            }
          )
        })
      }
    }
  }, [wordList])

  // タグモードの検索処理
  useEffect(() => {
    const temp: TagItemProps[] = []
    const keyword = modeTag.keyword

    // tag名からtagIDを取得
    tt.transaction((tt_tx) => {
      tt_tx.executeSql(
        'SELECT `id` FROM tags WHERE (`tag` LIKE ? || "%")',
        [keyword],
        (_, resultSet) => {
          console.log(resultSet)
        },
        () => {
          console.log('search tag failed (tag_table)')
          return false
        }
      )
    })

    tmt.transaction((tmt_tx) => {
      tmt_tx.executeSql(
        'SELECT `word_id` FROM tag_map WHERE (`tag_id` LIKE ? || "%")',
        [keyword]
      )
    })
  }, [modeTag])

  const onSubmit = (data: KeywordData) => {
    const { keyword } = data
    // modeに応じて検索キーワードを登録
    if (modeName.isModeSelected) {
      console.log('mode: name')
      setModeToName({
        isModeSelected: modeName.isModeSelected,
        keyword: keyword,
      })
    } else if (modeWord.isModeSelected) {
      console.log('mode: word')
      setModeToWord({
        isModeSelected: modeWord.isModeSelected,
        keyword: keyword,
      })
    } else if (modeTag.isModeSelected) {
      console.log('mode: tag')
      setModeToTag({ isModeSelected: modeTag.isModeSelected, keyword: keyword })
    }
  }

  const onPress = () => {
    setMode((mode + 1) % 3)
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
            name='keyword'
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
          <Button title={modeList[mode]} onPress={onPress} />
        </View>
        <View style={styles.list}>
          {empty ? (
            <></>
          ) : (
            <Card containerStyle={{ width: '100%', borderRadius: 4 }}>
              {modeList[mode] === '名前' ? (
                <FlatList
                  data={nameList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }: { item: NameItemProps }) => (
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
                            }}>{`${item.last_name} ${
                            item?.first_name || ''
                          }`}</ListItem.Title>
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
              ) : modeList[mode] === '用語' ? (
                <FlatList
                  data={wordList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }: { item: WordItemProps }) => (
                    <View>
                      <ListItem
                        key={item.word}
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
                            }}>
                            {item.word}
                          </ListItem.Title>
                          <ListItem.Subtitle style={{ color: 'grey' }}>
                            {`${item.abbreviation}`}
                          </ListItem.Subtitle>
                        </ListItem.Content>
                        <Icon name='chevron-right' size={32} color='grey' />
                      </ListItem>
                      <Card.Divider />
                    </View>
                  )}
                />
              ) : (
                <FlatList
                  data={wordList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }: { item: WordItemProps }) => (
                    <View>
                      <ListItem
                        key={item.word}
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
                            }}>
                            {item.word}
                          </ListItem.Title>
                          <ListItem.Subtitle style={{ color: 'grey' }}>
                            {`${item.abbreviation}`}
                          </ListItem.Subtitle>
                        </ListItem.Content>
                        <Icon name='chevron-right' size={32} color='grey' />
                      </ListItem>
                      <Card.Divider />
                    </View>
                  )}
                />
              )}
            </Card>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
