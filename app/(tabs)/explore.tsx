import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ellipsis, Search } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { createSongTable, getSongTable, insertSong, getSong } from '@/lib/schema';
import { Image } from '@/components/ui/image';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioContext } from '@/lib/audioSound';
import { SongCard } from '@/components/SongCard'
import { Header } from '@/components/Header'

interface Song {
  id: number
  title: string
  file: string
}

export default function ExploreScreen() {
  const bottom = useBottomTabBarHeight();
  const audioPlayer = useAudioContext();


  const [songs, setSongs] = useState<Song[]>([]);


  const pickMp3 = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'video/mp4'],
        copyToCacheDirectory: true,
      });

      if (result.assets?.length) {
        const uri = result.assets[0].uri;
        await insertSong(result.assets[0].name, uri);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  useEffect(() => {
    async function loadSongs() {
      await createSongTable();
      const songTable = await getSongTable();
      setSongs(songTable);
    }
    loadSongs();
  }, []);

  const setAndPlay = async (songId: number) => {
    try {
      const found = await getSong(songId);
      audioPlayer.replace(found.file || '');
      playSong();
    } catch (error) {
      console.error("Error setting and playing song: ", error);
    }
  }

  const playSong = () => {
    audioPlayer.play();
  }

  const pauseSong = () => {
    audioPlayer.pause();
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Header
        leftPress={() => {}}
        rightPress={pickMp3}
      />

      {/* Playlist Section */}
      <View style={styles.playlistSection}>
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onPress={() => setAndPlay(song.id)}
          />
        ))}
      </View>


      {/* Play buttons */}
      <View style={styles.container}>
        <Button onPress={() => playSong()} />
        <Button onPress={() => pauseSong()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 10, 
    backgroundColor: 'green' 
  },
  scrollView: { 
    flex: 1 
  },
  playlistSection: { 
    flexDirection: 'column', 
    alignItems: 'center', 
    backgroundColor: 'red', 
    gap: 10 
  },
});
