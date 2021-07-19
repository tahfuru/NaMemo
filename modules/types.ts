import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp, NavigatorScreenParams } from '@react-navigation/native'
import { NavigationTabProp } from 'react-navigation-tabs'
import * as SQLite from 'expo-sqlite'

export type StackParamList = {
  List: undefined
  Details: {
    id: string
    first_name?: string
    last_name?: string
    date?: Date
    affiliation?: string
    memo?: string
  }
}

export type ListScreenRouteProp = RouteProp<StackParamList, 'List'>
export type ListScreenNavigationProp = StackNavigationProp<
  StackParamList,
  'List'
>
export type DetailsScreenRouteProp = RouteProp<StackParamList, 'Details'>
export type DetailsScreenNavigationProp = StackNavigationProp<
  StackParamList,
  'Details'
>

export type TabParamList = {
  List: NavigatorScreenParams<StackParamList>
}

export type BottomTabParamList = {
  RegisterView: {
    db:
      | SQLite.WebSQLDatabase
      | {
          transaction: () => {
            executeSql: () => void
          }
        }
  }
  ListView: {
    db:
      | SQLite.WebSQLDatabase
      | {
          transaction: () => {
            executeSql: () => void
          }
        }
  }
}
export type RegisterViewScreenRouteProp = RouteProp<
  BottomTabParamList,
  'RegisterView'
>
export type RegisterViewScreenNavigationProp = NavigationTabProp<
  BottomTabParamList,
  'RegisterView'
>
export type ListViewScreenRouteProp = RouteProp<BottomTabParamList, 'ListView'>
export type ListViewScreenNavigationProp = NavigationTabProp<
  BottomTabParamList,
  'ListView'
>
