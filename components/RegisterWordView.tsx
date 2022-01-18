import React, { useState } from 'react'
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

import { getUniqueStr } from '../modules/register'
import {
  openWordDatabase,
  openTagTable,
  openTagMapTable,
} from '../modules/register'
import TagInput from './TagInput'

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
  // タグのPicker用のstate
  const [selectedTag, setSelectedTag] = useState([])

  const onSubmit = (data: FormData) => {
    const { word, description, abbreviation, memo, date, tags } = data
    const tagId: [string?] = []
    const wordId = getUniqueStr('w')
    const mapId = getUniqueStr('m')
    console.log(wordId)
    console.log(mapId)
    console.log(tags)
    console.log(word)
    return 0

    // submitされたデータをword_databaseに登録する
    wdb.transaction((tx) => {
      tx.executeSql(
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
      tx.executeSql('SELECT * FROM words', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      )
    })

    // tags配列から一つ一つのtagに対して
    // tag_tableからtagのidを取得
    for (const tag in tags) {
      tt.transaction((tx) => {
        tx.executeSql(
          'SELECT id FROM tags WHERE tag = ?',
          [tag],
          (_, { rows }) => tagId.push(JSON.stringify(rows))
        )
      })
    }
    // TODO もしtagが存在しない場合は生成する
    if (tagId.length == 0) {
      for (const tag in tags) {
        onTagSubmit({ tag })
      }
    }
    console.log('tagId is ' + tagId)

    // tag_map_tableにどのwordがどのtagを持っているかをidで組み合わせ管理
    // word_idは同一スコープ内で宣言されている
    // tagIdオブジェクトの持つ全てのtagidに対して
    for (const tagid in tagId) {
      tmt.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO tag_map (id, word_id, tag_id) VALUES (?, ?, ?)',
          [mapId, wordId, tagid],
          () => {
            console.log('insert words success')
          },
          () => {
            console.log('insert words failed')
            return false
          }
        )
        tx.executeSql('SELECT * FROM tag_map', [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        )
      })
    }

    Alert.alert(
      '登録完了',
      `「${
        word || abbreviation
      } 略称: ${abbreviation}, 説明: ${description}, メモ: ${
        memo || ''
      }」 で登録しました。`
    )
    reset()
  }

  // tag追加されたら走る関数
  const onTagSubmit = (data: TagData) => {
    const { tag } = data
    // tagIdはtで始まる
    const id = getUniqueStr('t')

    tt.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO tags (id, tag) VALUES (?, ?)',
        [id, tag],
        () => {
          console.log('insert tag success')
        },
        () => {
          console.log('insert tag failed')
          return false
        }
      )
      tx.executeSql('SELECT * FROM items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      )
    })
  }

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
            <Text style={styles.formTitle}>登録用語</Text>
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
            <Text style={styles.formTitle}>　　説明</Text>
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
            <Text style={styles.formTitle}>　　略称</Text>
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
            <Text style={styles.formTitle}>　　　タグ</Text>
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
            <Text style={styles.formTitle}>　　メモ</Text>
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
