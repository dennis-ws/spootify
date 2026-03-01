import { Button } from '@/components/ui/button';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { createPlaylistTable, insertPlaylist, getPlaylists, deletePlaylist, deleteTrackById, updatePlaylist } from '@/lib/schema';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input'

import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet'

import { useAudioContext, setAudioMode } from '@/lib/audioSound';
import { createTwoButtonAlert } from '@/components/ui/alert';

import { PlaylistCard } from '@/components/PlaylistCard'
import { Header } from '@/components/Header'

import { Sheetmode } from '@/lib/types';

import { Directory, File, Paths} from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const menuItems = [
  {id: 'add', title: 'Add playlist'},
  {id: 'delete', title: 'Delete playlists', destructive: true}
]
const editItems = [
  {id: 'rename', title: 'Rename playlist'},
  {id: 'change_image', title: 'Change playlist image', destructive: true}
]

export default function HomeScreen() {

  
  const [playlistName, setPlaylistName] = useState<string>("My Playlist");
  const playlistFormError = 
    !playlistName ? 'Please give the playlist a name' : '';

  const { isVisible, open, close } = useBottomSheet();
  const [addPlaylistForm, setAddPlaylistForm] = useState(false);
  const textColor = useColor('text');
  const destructiveColor = useColor('destructive');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editMode, setEditMode] = useState<Sheetmode>('menu');
  const [editPlaylistId, setEditPlaylistId] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const renameError = submitted && !newName.trim() ? 'Please give the playlist a name' : '';

  const playlistDirectory = new Directory(Paths.document, 'playlists');


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

  const pickImage = async () => {
      if (!editPlaylistId) return;
  
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Permission to access media library is required.'
        );
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });
  
      if (result.canceled || !result.assets?.length) return;

      if (!playlistDirectory.exists) {
        playlistDirectory.create();
      }
  
      const destinationDirectory = new Directory(
        playlistDirectory,
        editPlaylistId.toString()
      );
  
      if (!destinationDirectory.exists) {
        destinationDirectory.create();
      }
  
      // delete all file ending in .jpg in the destination directory 
      // (there should only be one, but just to be safe)
      const existingFiles = destinationDirectory.list();
      for (const file of existingFiles) {
        if (file.name.endsWith('.jpg')) {
          file.delete();
        }
      }
  
      const destinationFile = new File(destinationDirectory, Date.now().toString() + '_cover.jpg');
  
      if (destinationFile.exists) {
        destinationFile.delete();
      }
  
      const cacheFile = new File(result.assets[0].uri);
  
      cacheFile.copy(destinationFile);
  
      await updatePlaylist(editPlaylistId, 'image', destinationFile.uri);
      await loadPlaylists();
      close();
  
    };

  
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
    setEditMode('add');
    setPlaylistName("My Playlist");
  }

  const handleSubmit = () => {
    if (playlistName) {
      setEditMode('menu');
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
      await deleteTrackById(id, 'playlist_id');
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

  const handleEditAction = async (editId: string) => {
    if (editId === 'rename') {
      console.log('Renaming song with ID: ', editPlaylistId);
      setEditMode('rename');
      return;
    }
    
    if (editId === 'change_image') {
      // open a document picker to select the new image for the song, then update the song in the database
      // we will store the image in the same directory as the song file, with the name "cover.jpg"
      try {
        pickImage();
      } catch (error) {
        console.error('Error picking image file: ', error);
      }
    }
  }

    const openEditMenu = (songId: number) => {
      // open a menu with options to rename the song or change image file
      setEditMode('edit');
      setEditPlaylistId(songId);
      open();
    }
  
    const handleEditSubmit = async () => {
      setSubmitted(true);
  
      if (!editPlaylistId || !newName.trim()) return;
  
      await updatePlaylist(editPlaylistId, 'name', newName.trim());
      await loadPlaylists();
  
      setSubmitted(false);
      setEditMode('menu');
      setEditPlaylistId(null);
      setNewName('');
      close();
    };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Header
        heading="Playlists"
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
                onLongPress={() => {if (!selectionMode) {openEditMenu(playlist.id)}}}
              />
            )
          })}
      </View>
      
      {/* Menu */}
              <BottomSheet
                isVisible={isVisible}
                onClose={() => {
                  setEditMode('menu');
                  setEditPlaylistId(null);
                  setNewName('');
                  close();
                }}
              >
                  {/* Edit Menu*/}
                  {editMode === 'edit' && 
                    <View>
                    {editItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10
                        }}
                        onPress={() => handleEditAction(item.id)}
                        >
                        <Text style={{ fontSize: 20, marginRight: 16}}>Some icon</Text>
                        <Text
                          variant='body'
                          style={{
                          flex: 1,
                          }}
                        >{item.title}</Text>
                        </TouchableOpacity>
                      ))}
                        
                    </View>}
      
                  {/* Rename Menu */}
                  {editMode === 'rename' && <View>
                    <Text variant='title'>Rename song</Text>
                      <Input
                        label='Rename Playlist'
                        placeholder={playlists.find(p => p.id === editPlaylistId)?.name || ''}
                        value={newName}
                        onChangeText={(text) => 
                          setNewName(text)
                        }
                        variant='outline'
                        error={renameError}
                      />
                      <Button onPress={handleEditSubmit}>Rename Playlist</Button>
      
                    </View>
                  }
      
                  {/* Add/Delete Menu */}
                  {editMode === 'menu' && <View>
                    {menuItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10
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
                    ))}
                  </View>}

                  {editMode === 'add' &&
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
