import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from '@expo/vector-icons/MaterialIcons'

import RegisterView from './components/RegisterView'
import ListView from './components/ListView'

const Tab = createBottomTabNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName='追加'
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Home') {
              return (
                <Icon
                  name={focused ? 'person-add' : 'person-add-alt'}
                  size={size}
                  color={color}
                />
              )
            } else if (route.name === 'Settings') {
              return (
                <Icon
                  name={focused ? 'list' : 'list-alt'}
                  size={size}
                  color={color}
                />
              )
            }
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
          labelStyle: { fontSize: 16 },
          style: { height: 96 },
        }}>
        <Tab.Screen
          name='追加'
          component={RegisterView}
          options={{
            title: 'NaMemo',
            tabBarLabel: '追加',
            tabBarIcon: () => <Icon name='person-add' size={48} flex={1} />,
          }}
        />
        <Tab.Screen
          name='リスト'
          component={ListView}
          options={{
            tabBarLabel: 'リスト',
            tabBarIcon: () => <Icon name='list' size={48} flex={1} />,
          }}
        />
      </Tab.Navigator>
      <StatusBar style='auto' />
    </NavigationContainer>
  )
}

export default App
