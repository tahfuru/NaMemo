import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import Tags from 'react-native-tags'

const TagInput = () => (
  <Tags
    initialText='monkey'
    textInputProps={{
      placeholder: 'Any type of animal',
    }}
    initialTags={['dog', 'cat', 'chicken']}
    onChangeTags={(tags) => console.log(tags)}
    onTagPress={(index, tagLabel, event, deleted) =>
      console.log(index, tagLabel, event, deleted ? 'deleted' : 'not deleted')
    }
    containerStyle={styles.container}
    inputStyle={styles.input}
    renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
      <TouchableOpacity
        key={`${tag}-${index}`}
        onPress={onPress}
        style={styles.tag}>
        <Text>{tag}</Text>
      </TouchableOpacity>
    )}
  />
)

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 4,
    maxWidth: 250,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  tag: {
    backgroundColor: '#2A5353',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    marginTop: 0,
  },
  textTag: {
    color: '#EBEBEB',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#606060',
    fontWeight: 'bold',
  },
})

export default TagInput
