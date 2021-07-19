import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput } from 'react-native'
import { Button } from 'react-native-elements'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import dayjs from 'dayjs'
import { useForm, Controller } from 'react-hook-form'

import {
  DetailsScreenNavigationProp,
  DetailsScreenRouteProp,
} from '../modules/types'
import { openDatabase } from '../modules/register'

interface Props {
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

const db = openDatabase()

const Edit: React.VFC<Props> = ({ route, navigation }) => {
  const { id, last_name, first_name, date, affiliation, memo } = route.params
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()
  const [new_date, setDate] = useState(new Date())
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const onSubmit = (data: FormData) => {
    const { first_name, last_name, date, affiliation, memo } = data
    console.log(last_name)
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE items SET first_name=?, last_name=?, affiliation=?, memo=? WHERE id=id',
        [first_name, last_name, affiliation, memo],
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
    alert(
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
    <View style={styles.container}>
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
              placeholder={last_name}
            />
          )}
          name='last_name'
          defaultValue=''
        />
        {errors.last_name && <Text>Last name is required.</Text>}
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
              placeholder={first_name}
            />
          )}
          name='first_name'
          defaultValue=''
        />
        {errors.first_name && <Text>First name is required.</Text>}
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
              placeholder={affiliation}
            />
          )}
          name='affiliation'
          defaultValue=''
        />
        {errors.affiliation && <Text>Affiliation is required.</Text>}
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
              placeholder={memo}
            />
          )}
          name='memo'
          defaultValue=' '
        />
      </View>
      <Button
        title='更新'
        onPress={handleSubmit(onSubmit)}
        titleStyle={styles.buttonSubmit}
        containerStyle={{
          flex: 1,
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      />
    </View>
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

export default Edit
