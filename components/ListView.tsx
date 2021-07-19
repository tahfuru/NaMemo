import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import List from './List'
import Edit from './Edit'
import { StackParamList } from '../modules/types'

const Stack = createStackNavigator<StackParamList>()

const ListView: React.VFC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='List' component={List} />
      <Stack.Screen name='Details' component={Edit} />
    </Stack.Navigator>
  )
}

export default ListView
