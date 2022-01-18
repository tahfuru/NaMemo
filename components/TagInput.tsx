import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import Tags from 'react-native-tags'

type TagInputProps = {
  tagArray: string[]
  onChangeTags: (tags: string[]) => void
}

const TagInput = ({ tagArray, onChangeTags }: TagInputProps) => {
  return (
    <Tags
      initialText=''
      textInputProps={{
        placeholder: 'Any tag',
      }}
      initialTags={tagArray}
      onChangeTags={(tags) => {
        onChangeTags(tags)
      }}
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
          <TextInput value={tag} />
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 4,
    maxWidth: 250,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  tag: {
    backgroundColor: '#FFBA08',
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
