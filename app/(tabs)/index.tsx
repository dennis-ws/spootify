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
import { createPlaylistTable, insertPlaylist, getPlaylists, deletePlaylist, deletePlaylistSongs } from '@/lib/schema';
import { useEffect, useState } from 'react';
import AppLayout from '../applayout';
import { Image } from '@/components/ui/image';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input'

import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet'
import PlaylistMenu from '../playlistMenu'

import { useAudioContext, setAudioMode } from '@/lib/audioSound';
import { createTwoButtonAlert } from '@/components/ui/alert';

import { PlaylistCard } from '@/components/PlaylistCard'
import { Header } from '@/components/Header'


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
    async function init() {
      await createPlaylistTable();
      await loadPlaylists();
      setAudioMode();
    }
    init();
  }, []);

  
  async function loadPlaylists() {
    const playlists = await getPlaylists();
    setPlaylists(playlists);
    console.log(playlists);
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
    for (const id of selectedIds) {
      // Delete the playlist
      await deletePlaylist(id);
      console.log("Deleted playlist with ID: ", id);
      // Delete all playlist songs associated with the playlist
      await deletePlaylistSongs(id, 'playlist_id');
      console.log("Deleted playlist songs associated with playlist ID: ", id);
    };
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
      <Header
        leftPress={() => {}}
        rightPress={open}
      />

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
        {playlists.map((playlist) => {
          const isSelected = selectedIds.has(playlist.id)
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                isSelected={isSelected}
                destructiveColor={destructiveColor}
                onPress={() =>
                  selectionMode
                    ? toggleSelect(playlist.id)
                    : router.navigate(`/playlist/${playlist.id}`)
                }
              />
            )
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
  playlistSection: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10
  },


});
