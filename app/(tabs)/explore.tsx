import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ellipsis, Search } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { createSongTable, getSongTable, insertSong, getSong, updateSong, deleteSong, deletePlaylistSongs, getPlaylistSongsFromSid, createPlaylistSongsTable, getPlaylistSongs, getPlaylistSongsTable } from '@/lib/schema';
import { Image } from '@/components/ui/image';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioContext } from '@/lib/audioSound';
import { SongCard } from '@/components/SongCard'
import { Header } from '@/components/Header'


import { Directory, File, Paths} from 'expo-file-system';
import { Song } from '@/lib/types';
import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/useColor';
import { createTwoButtonAlert } from '@/components/ui/alert';


const menuItems = [
  {id: 'add', title: 'Add song'},
  {id: 'delete', title: 'Delete songs', destructive: true}
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
      destinationDirectory.create({overwrite: true}); // create a subdirectory for the song
    
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
          onClose={close}
        >
          
            <View>
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
            </View>
          
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
