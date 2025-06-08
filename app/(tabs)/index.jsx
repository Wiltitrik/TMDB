import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Switch,
} from 'react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { postAPI } from '../../services/postAPI';

export default function HomeScreen() {
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const systemTheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const mode = await AsyncStorage.getItem('darkMode');
      setDarkMode(mode === 'true');
    })();
    loadFavorites();
    fetchData();
  }, []);

  const loadFavorites = async () => {
    try {
      const json = await AsyncStorage.getItem('favorites');
      setFavorites(json ? JSON.parse(json) : []);
    } catch (e) {
      console.error('Erreur chargement favoris', e);
    }
  };

  const toggleFavorite = async (movie) => {
    try {
      const exists = favorites.some((m) => m.id === movie.id);
      const updated = exists
        ? favorites.filter((m) => m.id !== movie.id)
        : [...favorites, { id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average }];

      setFavorites(updated);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      Alert.alert(exists ? 'Favori retiré' : 'Ajouté aux favoris', `${movie.title} a été ${exists ? 'retiré' : 'ajouté'} de vos favoris.`);
    } catch (e) {
      console.error('Erreur toggleFavorite', e);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', newMode.toString());
  };

  const fetchData = async () => {
    try {
      const allMovies = await postAPI.getMovies();
      setPopular(allMovies);
      setTopRated([...allMovies].sort((a, b) => b.vote_average - a.vote_average));
      setRecent([...allMovies].sort((a, b) => new Date(b.release_date) - new Date(a.release_date)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = darkMode ? darkTheme : lightTheme;

  const renderMovieCard = ({ item }) => {
    const isFav = favorites.some((m) => m.id === item.id);
    return (
      <View style={styles.cardContainer}>
        <Link href={`/movies/${item.id}`} style={styles.cardLink}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
            style={styles.poster}
          />
          <Text style={[styles.albumName, themeStyles.text]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.artistName, themeStyles.subText]}>
            {item.vote_average.toFixed(1)}⭐ • {item.release_date}
          </Text>
        </Link>
        <TouchableOpacity style={styles.favButton} onPress={() => toggleFavorite(item)}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? '#e74c3c' : '#fff'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (title, data) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>{title}</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMovieCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loaderContainer, themeStyles.container]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, themeStyles.text]}>🎬 Catalogue de Films</Text>
        <View style={styles.switchContainer}>
          <Ionicons name={darkMode ? 'moon' : 'sunny'} size={20} color={themeStyles.text.color} />
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>
      {renderSection('Films populaires', popular)}
      {renderSection('Films les mieux notés', topRated)}
      {renderSection('Films les plus récents', recent)}
    </ScrollView>
  );
}

const lightTheme = {
  container: { backgroundColor: '#FFFFFF' },
  text: { color: '#000' },
  subText: { color: '#666' },
};

const darkTheme = {
  container: { backgroundColor: '#121212' },
  text: { color: '#FFFFFF' },
  subText: { color: '#AAAAAA' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingLeft: 16,
  },
  cardContainer: {
    width: 140,
    marginRight: 12,
  },
  cardLink: {
    flex: 1,
  },
  poster: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 6,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
  },
  artistName: {
    fontSize: 12,
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
});
