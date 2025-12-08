import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../components/Common/Input';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { geocodeLocation } from '../store/slices/routeSlice';
import { setOrigin, setDestination } from '../store/slices/routeSlice';
import { COLORS } from '../config/constants';

const SearchScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { searchResults, loading } = useSelector((state) => state.route);
  const [query, setQuery] = useState('');
  const searchType = route.params?.type || 'destination'; // 'origin' or 'destination'

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        dispatch(geocodeLocation(query));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [query, dispatch]);

  const handleSelectLocation = (location) => {
    const coordinate = {
      latitude: location.lat,
      longitude: location.lon,
      address: location.display_name,
    };

    if (searchType === 'origin') {
      dispatch(setOrigin(coordinate));
    } else {
      dispatch(setDestination(coordinate));
    }

    navigation.goBack();
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectLocation(item)}
    >
      <Icon name="place" size={24} color={COLORS.primary} style={styles.resultIcon} />
      <View style={styles.resultText}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.display_name.split(',')[0]}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={2}>
          {item.display_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {searchType === 'origin' ? 'Choose Starting Point' : 'Where to?'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={`Search for ${searchType === 'origin' ? 'origin' : 'destination'}...`}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderLocationItem}
          keyExtractor={(item, index) => `${item.place_id}-${index}`}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            query.length > 2 ? (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={48} color="#9E9E9E" />
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search" size={48} color="#9E9E9E" />
                <Text style={styles.emptyText}>Start typing to search</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    marginBottom: 0,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultIcon: {
    marginRight: 16,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 16,
  },
});

export default SearchScreen;
