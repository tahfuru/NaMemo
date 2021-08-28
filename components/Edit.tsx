import React, { useState } from 'react'
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native'
import { Button } from 'react-native-elements'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useForm, Controller } from 'react-hook-form'
import dayjs from 'dayjs'

import {
  DetailsScreenNavigationProp,
  DetailsScreenRouteProp,
} from '../modules/types'
import { openDatabase } from '../modules/register'

type EditProps = {
  route: DetailsScreenRouteProp
  navigation: DetailsScreenNavigationProp
}

type FormData = {
  id: string
  first_name?: string
  last_name: string
  date: Date
  affiliation: string
  memo?: string
}

const Edit = ({ route, navigation }: EditProps) => {
  const { id, last_name, first_name, affiliation, memo } = route.params
  const [date, setDate] = useState(
    new Date(dayjs(route.params.date).format('YYYY-MM-DD'))
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const onSubmitUpdate = (data: FormData) => {
    const { first_name, last_name, date, affiliation, memo } = data
    const db = openDatabase()
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE items SET first_name=?, last_name=?, date=?, affiliation=?, memo=? WHERE id=?',
        [
          first_name,
          last_name,
          dayjs(date).format('YYYY-MM-DD'),
          affiliation,
          memo,
          id,
        ],
        (txObj, resultSet) => {
          console.log('update items success')
        },
        (txObj, error) => {
          console.log('update values failed', error)
          return false
        }
      )
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      )
    })
    Alert.alert(
      '更新完了',
      `「${last_name} ${first_name || ''}さん, 日付: ${dayjs(date).format(
        'YYYY-MM-DD'
      )}, 関係: ${affiliation}, メモ: ${memo || ''}」 で登録しました。`
    )
    reset()
  }
  const onSubmitRemove = () => {
    const db = openDatabase()
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM items WHERE id=?',
        [id],
        (txObj, resultSet) => {
          console.log('delete items success')
        },
        (txObj, error) => {
          console.log('delete values failed', error)
          return false
        }
      )
    })
    Alert.alert(
      '削除完了',
      `「${last_name} ${first_name || ''}さん, 日付: ${dayjs(date).format(
        'YYYY-MM-DD'
      )}, 関係: ${affiliation}, メモ: ${memo || ''}」 を削除しました。`
    )
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleDatePicker = (selectedDate: Date) => {
    const currentDate = selectedDate
    setDate(currentDate)
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
                <>
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
                </>
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
              defaultValue={last_name}
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
              defaultValue={first_name}
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
              defaultValue={affiliation}
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
                  multiline={true}
                />
              )}
              name='memo'
              defaultValue={memo}
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <Button
              title='削除'
              onPress={handleSubmit(onSubmitRemove)}
              titleStyle={styles.buttonSubmitRemove}
              buttonStyle={{
                backgroundColor: '#D00000',
              }}
              containerStyle={{
                margin: 20,
                flex: 1,
              }}
            />
            <Button
              title='更新'
              onPress={handleSubmit(onSubmitUpdate)}
              titleStyle={styles.buttonSubmitUpdate}
              containerStyle={{
                margin: 20,
                flex: 1,
              }}
            />
          </View>
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
    flex: 1,
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
  buttonSubmitUpdate: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonSubmitRemove: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default Edit
