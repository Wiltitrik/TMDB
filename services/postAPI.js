export const postAPI = {
  baseUrl:"https://api.themoviedb.org/3",

   getMovies: async () => {
      try {
        const response = await fetch(`${postAPI.baseUrl}/movie/popular?api_key=${process.env.EXPO_PUBLIC_API_KEY}&language=fr-FR&page=1`);
        const data = await response.json();
        return data.results;
      } catch (error) {
        console.error(error);
        return [];
      }
   },
    getMovieDetails: async (movieId) => {
        try {
          const response = await fetch(`${postAPI.baseUrl}/movie/${movieId}?api_key=${process.env.EXPO_PUBLIC_API_KEY}&language=fr-FR&page=1`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(error);
          return null;
        }
    }, 
    // Récupérer les vidéos (trailers) d’un film
    getMovieVideos: async (id) => {
      const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.EXPO_PUBLIC_API_KEY}&language=fr`);
      return res.data.results;
    },
 
  }


