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
} from 'react-native'
import { Button } from 'react-native-elements'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useForm, Controller } from 'react-hook-form'
import dayjs from 'dayjs'

import { getUniqueStr } from '../modules/register'
import { openDatabase } from '../modules/register'

type FormData = {
  first_name?: string
  last_name?: string
  date?: Date
  affiliation?: string
  memo?: string
}

const RegisterView = () => {
  const db = openDatabase()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()
  const [date, setDate] = useState(new Date())
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const onSubmit = (data: FormData) => {
    const { first_name, last_name, date, affiliation, memo } = data
    const id = getUniqueStr()
    console.log(id)

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO items (id, first_name, last_name, date, affiliation, memo) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          first_name,
          last_name,
          dayjs(date).format('YYYY-MM-DD'),
          affiliation,
          memo,
        ],
        () => {
          console.log('insert items success')
        },
        () => {
          console.log('insert values failed')
          return false
        }
      )
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      )
    })
    Alert.alert(
      '登録完了',
      `「${last_name} ${first_name || ''}さん, 日付: ${dayjs(date).format(
        'YYYY-MM-DD'
      )}, 関係: ${affiliation}, メモ: ${memo || ''}」 で登録しました。`
    )
    reset()
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
            <Text style={styles.formTitle}>　姓</Text>
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
              name='last_name'
              defaultValue=''
            />
            {errors.last_name && <Text>姓は必須です。</Text>}
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>　名</Text>
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
              name='first_name'
              defaultValue=''
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>関係</Text>
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
              name='affiliation'
              defaultValue=''
            />
            {errors.affiliation && <Text>関係は必須です。</Text>}
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
    flex: 2,
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
    width: 200,
    padding: 10,
    borderRadius: 4,
    fontSize: 20,
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

export default RegisterView
