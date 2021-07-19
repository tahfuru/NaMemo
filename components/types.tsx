import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp, NavigatorScreenParams } from '@react-navigation/native'

export type StackParamList = {
  List: undefined
  Details: {
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
