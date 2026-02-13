import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ellipsis, Search } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createSongTable, getSongTable, insertSong, getSong, updateSong, deleteSong, 
  deletePlaylistSongs, getPlaylistSongsFromSid, 
  createPlaylistSongsTable, getPlaylistSongs, getPlaylistSongsTable, 
  getSongImage} from '@/lib/schema';
import { Image } from '@/components/ui/image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioContext } from '@/lib/audioSound';
import { SongCard } from '@/components/SongCard'
import { Header } from '@/components/Header'


import { Directory, File, Paths} from 'expo-file-system';
import { Song, Sheetmode} from '@/lib/types';
import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/useColor';
import { createTwoButtonAlert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';


const menuItems = [
  {id: 'add', title: 'Add song'},
  {id: 'delete', title: 'Delete songs', destructive: true}
]
const editItems = [
  {id: 'rename', title: 'Rename song'},
  {id: 'change_image', title: 'Change song image'}
]

export default function ExploreScreen() {
  const bottom = useBottomTabBarHeight();
  const audioPlayer = useAudioContext();

  const textColor = useColor('text');
  const destructiveColor = useColor('destructive');
  const { isVisible, open, close } = useBottomSheet();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [songs, setSongs] = useState<Song[]>([]);
  const [editMode, setEditMode] = useState<Sheetmode>('menu');
  const [editSongId, setEditSongId] = useState<number | null>(null);
  const [songName, setSongName] = useState<string>('');
  const [imageUri, setImageUri] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const renameError =
    submitted && !songName.trim()
      ? 'Please give the song a name'
      : '';

  const songDirectory = new Directory(Paths.document, 'songs');

  async function loadSongs() {
    await createSongTable();
    const songTable = await getSongTable();
    setSongs(songTable);
  }

  useEffect(() => {
    async function init() {
      await loadSongs();
      await createPlaylistSongsTable();
    }
    init();
  }, []);

  const pickMp3 = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'video/mp4'],
        copyToCacheDirectory: true,
      });

      if (!result.assets?.length) {
        console.log('No file selected');
        return;
      }
      
      const fileName = result.assets[0].name;
      const songId = await insertSong(fileName, ''); // temporary file path

      const songDirectory = new Directory(Paths.document, 'songs');

      if (!songDirectory.exists) {
        songDirectory.create();
      }

      
      const destinationDirectory = new Directory(songDirectory, songId.toString()); 
      if (!destinationDirectory.exists) {
        destinationDirectory.create();
      }

    
      const destinationFile = new File(destinationDirectory, fileName);
      const cacheFile = new File(result.assets[0].uri);

      if (destinationFile.exists) {
        destinationFile.delete();
      }
      cacheFile.copy(destinationFile);
      await updateSong(songId, 'file', destinationFile.uri);
      loadSongs();

    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const pickImage = async () => {
    if (!editSongId) return;

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

    const destinationDirectory = new Directory(
      songDirectory,
      editSongId.toString()
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

    // Just copy — Expo will create the file for you
    cacheFile.copy(destinationFile);

    await updateSong(editSongId, 'image', destinationFile.uri);
    await loadSongs();
    close();

  };


  const handleMenuAction = (itemId: string) => {
    tmp();
    if (itemId === 'add') {
      pickMp3();
      return;
    }
    if (itemId === 'delete') {
      setSelectionMode(true);
      close();
      return;
    }
  }

  const openMenu = () => {
    setSelectionMode(false);
    open();
  }


  const setAndPlay = async (songId: number) => {
    try {
      const found = await getSong(songId);
      audioPlayer.replace(found.file || '');
      playSong();
    } catch (error) {
      console.error("Error setting and playing song: ", error);
    }
  }

  // we will remove the song from our database,
  // then check if any playlist songs are associated with that song and remove the song
  // from those playlists as well. 
  // finally we will remove the song file from the device storage
  const handleRemoveSong = async () => {
    console.log('Removing songs with IDS: ', Array.from(selectedIds));

    for (const sid of selectedIds) {
      try {
        await deleteSong(sid);
        console.log(`Deleted song with ID ${sid}`);

        const pids = await getPlaylistSongsFromSid(sid);
        console.log(`Found ${pids.length} playlist songs associated with song ID ${sid}`);

        for (const pid of pids) {
          await deletePlaylistSongs(pid.id);
          console.log(`Deleted playlist song ${pid.id}`);
        }

        const sidDirectory = new Directory(songDirectory, sid.toString());
        console.log(sidDirectory);
        if (sidDirectory.exists) {
          sidDirectory.delete();
        }
      } catch (error) {
        console.error(`Error deleting song with ID ${sid}: `, error);
      }
    }

    setSelectionMode(false);
    setSelectedIds(new Set());
    await loadSongs();
    const currentSongs = await getSongTable();
    console.log('Current songs after deletion: ', currentSongs);
  };


  const playSong = () => {
    audioPlayer.play();
  }

  const pauseSong = () => {
    audioPlayer.pause();
  }

  const tmp = async () => {
    const db = await getSongTable();
    console.log(db);
    const pdb = await getPlaylistSongsTable();
    console.log(pdb);
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
            onPress: handleRemoveSong, 
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
      console.log('Renaming song with ID: ', editSongId);
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
    setEditSongId(songId);
    open();
  }

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!editSongId || !songName.trim()) return;

    await updateSong(editSongId, 'title', songName.trim());
    await loadSongs();

    setSubmitted(false);
    setEditMode('menu');
    setEditSongId(null);
    setSongName('');
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
        leftPress={() => {}}
        rightPress={openMenu}
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
        {songs.map((song) => {
          const isSelected = selectedIds.has(song.id);

          return (
            <SongCard
              key={song.id}
              song={song}
              isSelected={isSelected}
              destructiveColor={destructiveColor}
              onPress={() => 
                selectionMode
                  ? toggleSelect(song.id)
                  : setAndPlay(song.id)}
              onLongPress={() => {
                if (!selectionMode) {
                  openEditMenu(song.id);
                }
              }}
            />
          )
        })}
      </View>


      {/* Play buttons */}
      <View style={styles.container}>
        <Button onPress={() => playSong()} />
        <Button onPress={() => pauseSong()} />
      </View>

        {/* Menu */}
        <BottomSheet
          isVisible={isVisible}
          onClose={() => {
            setEditMode('menu');
            setEditSongId(null);
            setSongName('');
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
                  label='Rename Song'
                  placeholder={songs.find(s => s.id === editSongId)?.title || ''}
                  value={songName}
                  onChangeText={(text) => 
                    setSongName(text)
                  }
                  variant='outline'
                  error={renameError}
                />
                <Button onPress={handleSubmit}>Rename Song</Button>

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
    flex: 1 
  },
  playlistSection: { 
    flexDirection: 'column', 
    alignItems: 'center', 
    backgroundColor: 'red', 
    gap: 10 
  },
});
