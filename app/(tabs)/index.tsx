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
import { createPlaylistTable, insertPlaylist, getPlaylists, deletePlaylist } from '@/lib/schema';
import { useEffect, useState } from 'react';
import AppLayout from '../applayout';
import { Image } from '@/components/ui/image';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input'

import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet'
import PlaylistMenu from '../playlistMenu'

import { useAudioContext, setAudioMode } from '@/lib/audioSound';
import { createTwoButtonAlert } from '@/components/ui/alert';


const { width } = Dimensions.get('window');

const menuItems = [
  {id: 'add', title: 'Add playlist'},
  {id: 'delete', title: 'Delete playlists', destructive: true}
]

export default function HomeScreen() {

  
  const [playlistName, setPlaylistName] = useState<string>("My Playlist");
  const playlistFormError = 
    !playlistName ? 'Please give the playlist a name' : '';

  const { isVisible, open, close } = useBottomSheet();
  const [addPlaylistForm, setAddPlaylistForm] = useState(false);
  const audioPlayer = useAudioContext();
  const textColor = useColor('text');
  const destructiveColor = useColor('destructive');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());


  const router = useRouter();
  const [playlists, setPlaylists] = useState<any[]>([]);

  const bottom = useBottomTabBarHeight();
  useEffect(() => {
    loadPlaylists();
    setAudioMode();
  }, []);

  
  async function loadPlaylists() {
    const playlists = await getPlaylists();
    setPlaylists(playlists);
  }

  const snapPointHeight = () => {
    if (!addPlaylistForm) {
      return [0.4]
    }
    return [0.8]
  }

  const playSong = () => {
    audioPlayer.play();
  };

  const stopSong = () => {
    audioPlayer.pause();
  };

  const handleMenuAction = (itemId: string) => {
    if (itemId === 'add') {
      showAddPlaylistForm();
      return;
    }

    if (itemId === 'delete') {
      setSelectionMode(true);
      close();
      return;
    }
  }

  const showAddPlaylistForm = () => {
    console.log('Bringing up the playlist form');
    setAddPlaylistForm(true);
    setPlaylistName("My Playlist");
  }

  const handleSubmit = () => {
    if (playlistName) {
      setAddPlaylistForm(false);
      addPlaylist();
      close();
    }
  }

  const addPlaylist = async () => {
    console.log('Adding new playlist');
    await insertPlaylist(playlistName); 
    await loadPlaylists();
  }

  const removePlaylist = async () => {
    console.log('Removing playlist')
    selectedIds.forEach(async (id) => await deletePlaylist(id));
    setSelectionMode(false);
    setSelectedIds(new Set());
    await loadPlaylists();
  }

  const handleClose = () => {
    setAddPlaylistForm(false);
    close();
  }

  const confirmDelete = () => {
    createTwoButtonAlert({
      title: 'Confirm Deletion',
      message: `Delete ${selectedIds.size} playlist(s)? This cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // do nothing, dont delete anything
          },
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: removePlaylist, 
        },
      ],
    });
  };


  const toggleSelect = (id: number) => {
    console.log('I reached here!')
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    })
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
          <Text variant='heading'>Playlist</Text>

          <ModeToggle />
        </View>

        {/* Search and Setting buttons */}
        <View style={styles.headerButtons}>
          <Button icon={Search} variant='secondary' onPress={() => {}}></Button>

          <Button icon={Ellipsis} variant='secondary' onPress={open}></Button>
        </View>
      </View>

      {selectionMode && (
        <View style={{ padding: 16 }}>
          <Button
            variant="destructive"
            onPress={confirmDelete}
            disabled={selectedIds.size === 0}
          >
            Delete
          </Button>

          <Button
            variant="secondary"
            onPress={() => {
              setSelectionMode(false);
              setSelectedIds(new Set());
            }}
          >
            Cancel
          </Button>
        </View>
      )}




      {/* Playlist Section */}
      <View style={styles.playlistSection}>
        {/* Playlist Item */}
        {playlists.map((playlist) => {
          const isSelected = selectedIds.has(playlist.id);

          return (
            <TouchableOpacity
              key={playlist.id}
              onPress={() =>
                selectionMode
                  ? toggleSelect(playlist.id)
                  : router.navigate(`/playlist/${playlist.id}`)
              }
            >
              <View
                style={[
                  styles.playlistContent,
                  isSelected && { padding: 10, borderWidth: 2, borderColor: destructiveColor }
                ]}
              >
                <Image
                  source={require('@/assets/images/icon.png')}
                  contentFit="cover"
                  width={80}
                  height={80}
                />
                <Text>{playlist.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

       {/* Play buttons */}
      <View style={styles.container}>
        <Button onPress={playSong} />
        <Button onPress={stopSong} />
      </View>
      
      {/* Bottom Sheet*/}
      <BottomSheet
        isVisible={isVisible}
        onClose={handleClose}
        snapPoints={snapPointHeight()}
      >
        {!addPlaylistForm && 
        <View>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleMenuAction(item.id)}
            >
              <Text style={{ fontSize: 20, marginRight: 16}}>Some icon</Text>
              <Text
                variant='body'
                style={{
                  flex: 1,
                  color: item.destructive ? destructiveColor : textColor
                }}
              >{item.title}</Text>
            </TouchableOpacity>
          ))
          }
        </View>}

        {addPlaylistForm &&
        <View>
          <Input
            label='Playlist Name'
            placeholder={playlistName}
            value={playlistName}
            onChangeText={(text) => 
              setPlaylistName(text)
            }
            variant='outline'
            error={playlistFormError}
          />
          <Button onPress={handleSubmit}>Make Playlist</Button>
        </View>
        }
        
      </BottomSheet>
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
    gap: 10
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    height: 100,
    gap: 20,
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
