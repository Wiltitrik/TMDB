import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { Link } from 'expo-router';
import { postAPI } from '../../services/postAPI';

const genresList = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

const { width: screenWidth } = Dimensions.get('window');

export default function Recherche() {
  const [search, setSearch] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const reviews = [
    { id: 1, title: 'Great thriller', user: 'Alice', note: 85 },
    { id: 2, title: 'Lovely drama', user: 'Bob', note: 78 },
    { id: 3, title: 'Hilarious', user: 'Carol', note: 90 },
  ];
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movies = await postAPI.getMovies();
        setAllMovies(movies);
        setFilteredMovies(movies);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let data = allMovies;
    if (selectedGenre) {
      data = data.filter((m) => m.genre_ids.includes(selectedGenre.id));
    }
    if (search) {
      data = data.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredMovies(data);
  }, [selectedGenre, search, allMovies]);

  const renderMovie = ({ item }) => (
    <Link href={`/movies/${item.id}`} style={styles.card}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
        style={styles.poster}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardMeta}>⭐ {item.vote_average?.toFixed(1) || 'N/A'}</Text>
      </View>
    </Link>
  );

  const renderReview = ({ item }) => (
    <View style={[styles.reviewCard, { width: screenWidth * 0.7 }]}>  
      <Text style={styles.reviewTitle}>{item.title}</Text>
      <Text style={styles.reviewUser}>{item.user}</Text>
      <View style={styles.reviewNoteContainer}>
        <Text style={styles.reviewNote}>{item.note}%</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Rechercher</Text>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un film"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Catégories</Text>
      <View style={styles.genreContainer}>
        {genresList.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreButton,
              selectedGenre?.id === genre.id && styles.genreButtonSelected,
            ]}
            onPress={() => setSelectedGenre(selectedGenre?.id === genre.id ? null : genre)}
          >
            <Text style={[styles.genreText, selectedGenre?.id === genre.id && styles.genreTextSelected]}>{genre.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Résultats</Text>
      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMovie}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />

      <Text style={styles.sectionTitle}>Street Share</Text>
      <Animated.FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderReview}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        style={styles.reviewsContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { fontSize: 28, fontWeight: '800', marginTop: 48, marginHorizontal: 16, color: '#111' },
  searchWrapper: { marginTop: 16, marginHorizontal: 16, marginBottom: 24 },
  searchInput: { backgroundColor: '#F0F0F0', borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 12, color: '#222' },
  genreContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16 },
  genreButton: { backgroundColor: '#EFEFEF', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, margin: 4 },
  genreButtonSelected: { backgroundColor: '#222' },
  genreText: { fontSize: 14, color: '#333', fontWeight: '600' },
  genreTextSelected: { color: '#FFF' },
  horizontalList: { paddingLeft: 16, paddingVertical: 8 },
  card: { width: 140, marginRight: 16, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  poster: { width: '100%', height: 200 },
  cardInfo: { paddingHorizontal: 8, paddingVertical: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardMeta: { fontSize: 14, color: '#666', marginTop: 4 },
  reviewsContainer: { marginTop: 12, paddingLeft: 16 },
  reviewCard: { backgroundColor: '#333', borderRadius: 16, padding: 20, marginRight: 16, alignItems: 'center' },
  reviewTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  reviewUser: { color: '#CCC', fontSize: 14, marginTop: 6 },
  reviewNoteContainer: { marginTop: 8, backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  reviewNote: { color: '#333', fontSize: 16, fontWeight: '800' },
});
