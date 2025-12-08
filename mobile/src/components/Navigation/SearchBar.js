import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../config/constants';

const SearchBar = ({ value, onChangeText, onFocus, placeholder, onClear }) => {
  return (
    <View style={styles.container}>
      <Icon name="search" size={24} color="#9E9E9E" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder || 'Search for a location...'}
        placeholderTextColor="#9E9E9E"
      />
      {value ? (
        <TouchableOpacity onPress={onClear}>
          <Icon name="close" size={24} color="#9E9E9E" style={styles.icon} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
});

export default SearchBar;
