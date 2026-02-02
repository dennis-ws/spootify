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



export default function ExploreScreen() {
  const bottom = useBottomTabBarHeight();
  const audioPlayer = useAudioContext();


  const [songs, setSongs] = useState<any[]>([]);


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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text variant="heading">Songs</Text>
          <ModeToggle />
        </View>

        <View style={styles.headerButtons}>
          <Button icon={Search} variant="secondary" onPress={() => {}} />
          <Button icon={Ellipsis} variant="secondary" onPress={pickMp3} />
        </View>
      </View>

      {/* Playlist Section */}
      <View style={styles.playlistSection}>
        {songs.map((song) => (
          <TouchableOpacity key={song.id} onPress={() => setAndPlay(song.id)}>
            <View style={styles.playlistContent}>
              <Image
                source={require('@/assets/images/icon.png')}
                contentFit="cover"
                width={80}
                height={80}
                style={{ flex: 1 }}
              />
              <Text style={{ flex: 2 }}>{song.title}</Text>
            </View>
          </TouchableOpacity>
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
  header: { 
    paddingTop: 64, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    gap: 10 
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  headerButtons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    gap: 10 
  },
  playlistSection: { 
    flexDirection: 'column', 
    alignItems: 'center', 
    backgroundColor: 'red', 
    gap: 10 
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
    borderRadius: 8,
    width: '80%',
    height: 100,
    gap: 20,
    padding: 10,
  },
});
