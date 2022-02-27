import React, { useState, useEffect } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { Button } from 'react-native-elements'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useForm, Controller } from 'react-hook-form'
import dayjs from 'dayjs'

import { getUniqueStr, registerTag, registerWord } from '../modules/register'
import {
  openWordDatabase,
  openTagTable,
  openTagMapTable,
} from '../modules/register'
import TagInput from './TagInput'
import { GetTagListProps, TagList } from '../modules/types'

type FormData = {
  word: string
  description?: string
  abbreviation?: string
  memo?: string
  date?: Date
  tags?: string[]
}

type TagData = {
  tag: string
  tt_id: string
}

const RegisterWordView = () => {
  const wdb = openWordDatabase()
  const tt = openTagTable()
  const tmt = openTagMapTable()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  const [date, setDate] = useState(new Date())
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const [wordId, setWordId] = useState<string>(getUniqueStr('w'))
  const [registeredTag, setRegisteredTag] = useState<{
    tag: string
    wordId: string
    tagId: string
  }>({ tag: '', wordId: '', tagId: '' })
  const [notRegisteredTag, setNotRegisteredTag] = useState('')
  const [registerTagMap, setRegisterTagMap] = useState(false)
  // タグのPicker用のstate
  const [selectedTag, setSelectedTag] = useState([])

  const onSubmit = (data: FormData) => {
    const { word, description, abbreviation, memo, date, tags } = data
    const tagId: string[] = []
    console.log('onSubmit')
    console.log(wordId)
    console.log(tags)
    console.log(word)

    // TODO 2/15
    // 登録したい内容はstateとしてviewで管理=> useEffectで連鎖もしたい
    // register関数は各データベースにデータを登録することにのみ責任を負う

    // submitされたデータをword_databaseに登録する
    registerWord({ wordId, word, description, abbreviation, memo, date, wdb })

    // tagが入力されていたらtag_tableに登録
    if (tags !== undefined) {
      // 未登録のtagのみ取得
      getTagList({ tags })
    }
    Alert.alert(
      '登録完了',
      `「${
        word || abbreviation
      } 略称: ${abbreviation}, 説明: ${description}, タグ：${
        tags || ''
      } メモ: ${memo || ''}」 で登録しました。`
    )
    reset()
    setWordId(getUniqueStr('w'))
  }

  // 未登録のtagのリストを取得
  const getTagList = (data: GetTagListProps) => {
    const { tags } = data
    console.log('getTagList: ' + tags)
    for (const tag of tags) {
      console.log('loop `' + tag + '` in getTagList')
      tt.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM tags WHERE tag = ?',
          [tag],
          (_, { rows }) => {
            console.log('number of results are ' + rows.length)
            if (rows.length === 0) {
              console.log(tag)
              setNotRegisteredTag(tag)
            } else {
              console.log('tag *' + tag + '* exists in database')
              setRegisteredTag({
                tag: tag,
                wordId: wordId,
                tagId: rows.item(0).id,
              })
              console.log(rows.item(0))
            }
          }
        )
      })
    }
  }

  // add new tag to tag_table
  useEffect(() => {
    const tt_id = getUniqueStr('t')
    registerTag({ tt_id, tag: notRegisteredTag, tt })
    setRegisteredTag({ tag: notRegisteredTag, wordId: wordId, tagId: tt_id })
  }, [notRegisteredTag])

  // tagが追加された => set registerTagMap to true
  useEffect(() => {
    setRegisterTagMap(!registerTagMap)
  }, [registeredTag])

  // map word and tag into tag_map_table
  useEffect(() => {
    const mapId = getUniqueStr('m')
    tmt.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO tag_map (id, word_id, tag_id) VALUES (?, ?, ?)',
        [mapId, wordId, registeredTag.tagId]
      )
    })
  }, [registerTagMap])

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleDatePicker = (selectedDate: Date) => {
    const currentDate = selectedDate || date
    setDate(currentDate)
    console.log(selectedDate)
    hideDatePicker()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={styles.container}>
          <View style={styles.dateForm}>
            <Button
              onPress={showDatePicker}
              title='日付'
              titleStyle={styles.buttonDate}
            />
            <Controller
              name='date'
              control={control}
              rules={{
                required: false,
              }}
              defaultValue={date}
              render={({ field }) => (
                <View>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode='date'
                    onConfirm={handleDatePicker}
                    onCancel={hideDatePicker}
                    confirmTextIOS='決定'
                    cancelTextIOS='キャンセル'
                    date={date}
                    onChange={(date) => field.onChange(date)}
                    textColor='black'
                    pickerContainerStyleIOS={styles.pickerContainerStyleIOS}
                  />
                  <Text style={styles.dateText}>
                    {dayjs(date).format('YYYY年MM月DD日')}
                  </Text>
                </View>
              )}
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>用語</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name='word'
              defaultValue=''
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>説明</Text>
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
                />
              )}
              name='description'
              defaultValue=''
            />
            {errors.description && <Text>説明は必須です。</Text>}
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>略称</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name='abbreviation'
              defaultValue=''
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>　　タグ</Text>
            <ScrollView contentContainerStyle={styles.tagForm}>
              <Controller
                control={control}
                rules={{
                  required: false,
                }}
                render={({ field }) => (
                  <TagInput
                    tagArray={selectedTag}
                    onChangeTags={(tags) => field.onChange(tags)}
                  />
                )}
                name='tags'
                defaultValue={[]}
              />
            </ScrollView>
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>メモ</Text>
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
                  multiline={true}
                />
              )}
              name='memo'
              defaultValue=''
            />
          </View>
          <Button
            title='登録'
            onPress={handleSubmit(onSubmit)}
            titleStyle={styles.buttonSubmit}
            containerStyle={{
              flex: 1,
              marginTop: 10,
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  buttonDate: {
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#59C3C3',
    justifyContent: 'center',
  },
  pickerContainerStyleIOS: {
    backgroundColor: 'white',
  },
  dateForm: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  },
  dateText: {
    padding: 10,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: 'black',
    width: 250,
    padding: 10,
    borderRadius: 4,
    fontSize: 20,
  },
  tagForm: {
    maxHeight: 200,
  },
  form: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 20,
    marginRight: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonSubmit: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default RegisterWordView
