import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BookOpen, Stars, Search, Ellipsis } from 'lucide-react-native';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { createPlaylistTable, insertPlaylist, getPlaylists } from '@/lib/schema';
import { useEffect, useState } from 'react';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [playlists, setPlaylists] = useState<any[]>([]);

  const bottom = useBottomTabBarHeight();
  useEffect(() => {
    async function testDB() {
      console.log("Hello World!");
      const playlists = await getPlaylists();
      console.log("Playlists:", playlists);
      setPlaylists(playlists);
    }

    testDB();
  }, []);


  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text variant='heading'>Playlist</Text>

          <ModeToggle />
        </View>

        {/* Search and Setting buttons */}
        <View style={styles.headerButtons}>
          <Button icon={Search} variant='secondary' onPress={() => {}}></Button>

          <Button icon={Ellipsis} variant='secondary' onPress={() => {}}></Button>
        </View>
      </View>


      {/* Playlist Section */}
      <View style={styles.playlistSection}>
        {/* Playlist Item */}
        {playlists.map((playlist) => (
          <TouchableOpacity key={playlist.id} style={styles.playlistContent}>
            <Text>{playlist.name}</Text>
            <Text>{playlist.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'red',
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 8,
  },




  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  heroDescription: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width - 80,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  gettingStartedSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gettingStartedCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  terminalTitle: {
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: '100%',
  },
  bashCommand: {
    fontFamily: 'monospace',
    // color: '#00ff00',
    fontSize: 16,
    textAlign: 'center',
  },
  installDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  gettingStartedText: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  gettingStartedButton: {
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
