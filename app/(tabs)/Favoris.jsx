import React, {  useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const CARDS_PER_SCREEN = 3;

export default function Favoris() {
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const loadFavorites = async () => {
    try {
      const json = await AsyncStorage.getItem('favorites');
      setFavorites(json ? JSON.parse(json) : []);
    } catch (e) {
      console.error('Erreur chargement favoris', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (id) => {
    try {
      const updated = favorites.filter((m) => m.id !== id);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      setFavorites(updated);
      Alert.alert('Favori retiré', 'Le film a été retiré de vos favoris.');
    } catch (e) {
      console.error('Erreur removeFavorite', e);
    }
  };

  const renderGridItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Link href={`/movies/${item.id}`} style={styles.cardLink}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
          style={styles.posterGrid}
        />
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
      </Link>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  const cardWidth = screenWidth / CARDS_PER_SCREEN - 16;
  const sidePadding = (screenWidth - cardWidth) / 2;

  const renderCarouselItem = ({ item }) => (
    <View style={[styles.carouselItem, { width: cardWidth }]}>      
      <Link href={`/movies/${item.id}`} style={styles.carouselLink}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
          style={styles.carouselImage}
        />
      </Link>
      <TouchableOpacity
        style={styles.removeButtonCarousel}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Vous n’avez pas encore de favoris.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mes Favoris</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'carousel' : 'grid')}>
          {viewMode === 'grid' ? (
            <MaterialIcons name="view-carousel" size={28} color="#333" />
          ) : (
            <MaterialIcons name="grid-view" size={28} color="#333" />
          )}
        </TouchableOpacity>
      </View>

      {viewMode === 'grid' ? (
        <FlatList
          key="grid"
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGridItem}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          key="carousel"
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCarouselItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.carousel, { paddingHorizontal: sidePadding }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  header: { fontSize: 24, fontWeight: '700', color: '#333' },
  list: { paddingHorizontal: 8 },
  cardContainer: { flex: 1, margin: 8, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  cardLink: { flex: 1 },
  posterGrid: { width: '100%', height: 220 },
  title: { fontSize: 14, fontWeight: '600', color: '#333', padding: 8 },
  removeButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 4 },
  removeButtonCarousel: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  carousel: { paddingVertical: 16 },
  carouselItem: { marginHorizontal: 8, alignItems: 'center' },
  carouselLink: { flex: 1 },
  carouselImage: { width: '100%', height: 180, borderRadius: 8 },
});
