import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'

import List from './List'
import Edit from './Edit'
import {
  StackParamList,
  ListScreenNavigationProp,
  ListScreenRouteProp,
  TabParamList,
} from './types'

const Stack = createStackNavigator<StackParamList>()

type Props = {
  route: ListScreenRouteProp
  navigation: ListScreenNavigationProp
}

const ListView: React.VFC = () => {
  const navigation = useNavigation<ListScreenNavigationProp>()

  return (
    <Stack.Navigator>
      <Stack.Screen name='List' component={List} />
      <Stack.Screen name='Details' component={Edit} />
    </Stack.Navigator>
  )
}

export default ListView
