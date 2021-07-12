import React from 'react'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import Icon from '@expo/vector-icons/MaterialIcons'

const Tab = createMaterialBottomTabNavigator()

const Register = () => {
  return <></>
}
const List = () => {
  return <></>
}
const TabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        barStyle={{
          backgroundColor: 'tomato',
        }}>
        <Tab.Screen
          name='追加'
          component={Register}
          options={{
            tabBarLabel: '追加',
            tabBarIcon: () => <Icon name='person-add' size={25} flex={1} />,
          }}
        />
        <Tab.Screen
          name='リスト'
          component={List}
          options={{
            tabBarLabel: 'リスト',
            tabBarIcon: () => <Icon name='list' size={25} flex={1} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default TabNavigator
