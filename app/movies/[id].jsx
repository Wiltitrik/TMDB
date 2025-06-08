import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Animated, { FadeIn } from 'react-native-reanimated';
import { postAPI } from '../../services/postAPI';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = screenWidth * 1.25;

export default function MovieDetail() {
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    bg: isDark ? '#121212' : '#FDFDFD',
    text: isDark ? '#FFFFFF' : '#111',
    subText: isDark ? '#AAAAAA' : '#444',
    badgeBg: isDark ? '#1F1F1F' : '#EFEFEF',
  };

  const fetchData = async () => {
    try {
      const data = await postAPI.getMovieDetails(id);
      setMovie(data);
      const json = await AsyncStorage.getItem('favorites');
      const favs = json ? JSON.parse(json) : [];
      setIsFavorite(favs.some((m) => m.id === data.id));

      const videos = await postAPI.getMovieVideos(id);
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) setTrailerKey(trailer.key);

      const similar = await postAPI.getSimilarMovies(id);
      setSimilarMovies(similar.slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const json = await AsyncStorage.getItem('favorites');
      const favs = json ? JSON.parse(json) : [];
      let updated;

      if (isFavorite) {
        updated = favs.filter((m) => m.id !== movie.id);
      } else {
        updated = [...favs, { id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average }];
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading || !movie) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}> 
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <Animated.ScrollView
      entering={FadeIn.duration(500)}
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={32}
            color={isFavorite ? '#e74c3c' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{movie.title}</Text>
        <Text style={[styles.meta, { color: theme.subText }]}>{movie.release_date} • {movie.runtime} min</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{movie.vote_average?.toFixed(1) || 'N/A'}</Text>
          <Text style={[styles.ratingCount, { color: theme.subText }]}>/10</Text>
        </View>

        <View style={styles.genreContainer}>
          {movie.genres.map((g) => (
            <View key={g.id} style={[styles.genreBadge, { backgroundColor: theme.badgeBg }]}> 
              <Text style={[styles.genreText, { color: theme.text }]}>{g.name}</Text>
            </View>
          ))}
        </View>

        {trailerKey && (
          <TouchableOpacity style={styles.trailerButton} onPress={() => setShowTrailer(true)}>
            <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.trailerButtonText}>Regarder la bande-annonce</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.synopsisTitle, { color: theme.text }]}>Synopsis</Text>
        <Text style={[styles.synopsis, { color: theme.subText }]}>{movie.overview}</Text>

        {similarMovies.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.synopsisTitle, { color: theme.text }]}>Films similaires</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similarMovies.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => router.push(`/movies/${m.id}`)}
                  style={{ marginRight: 12 }}
                >
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w200${m.poster_path}` }}
                    style={{ width: 100, height: 150, borderRadius: 8 }}
                  />
                  <Text numberOfLines={1} style={{ color: theme.subText, width: 100, fontSize: 12 }}>
                    {m.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <Modal visible={showTrailer} animationType="slide" onRequestClose={() => setShowTrailer(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Pressable style={styles.closeButton} onPress={() => setShowTrailer(false)}>
            <Ionicons name="close-circle" size={32} color="#fff" />
          </Pressable>
          <WebView
            source={{ uri: `https://www.youtube.com/embed/${trailerKey}` }}
            style={{ flex: 1 }}
            allowsFullscreenVideo
          />
        </View>
      </Modal>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  posterContainer: { position: 'relative' },
  poster: { width: '100%', height: IMAGE_HEIGHT, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  favButton: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 6 },
  infoContainer: { padding: 16 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  meta: { fontSize: 16, marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  rating: { fontSize: 28, fontWeight: '700', color: '#FF6347' },
  ratingCount: { fontSize: 16, marginLeft: 4, marginBottom: 4 },
  genreContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  genreBadge: { borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  genreText: { fontSize: 14, fontWeight: '600' },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 20,
  },
  trailerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  synopsisTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  synopsis: { fontSize: 16, lineHeight: 24 },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
});
