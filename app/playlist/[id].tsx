import { ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { getPlaylistSongsTable, createPlaylistSongsTable, insertPlaylistSongsTable, getSongTable, insertPlaylist, getSong, getSongsFromPlaylist } from '@/lib/schema';
import { Ellipsis, Search } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/lib/audioSound';
import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/useColor'
import { createTwoButtonAlert } from '@/components/ui/alert'
import { Header } from '@/components/Header'
import { PlaylistSongCard } from '@/components/PlaylistSongCard'

const menuItems = [
  {id: 'add', title: 'Add playlist'},
  {id: 'delete', title: 'Delete playlists', destructive: true}
]

interface PlaylistSong {
    id: number
    title: string
    position: number | null
    file: string
}

export default function Playlist() {
    const audioPlayer = useAudioContext();
    const { id } = useLocalSearchParams();
    const idNumber = Number(id);
    const navigation = useNavigation();
    const {isVisible, open, close} = useBottomSheet();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [addPlaylistSong, setAddPlaylistSong] = useState(false);
    const destructiveColor = useColor('destructive');
    const textColor = useColor('text');


    const [playlistSongs, setPlaylistSongs] = useState<any[]>();
    const [songs, setSongs] = useState<PlaylistSong[]>([]);
    const selected = useColor('green');

    const loadPlaylistSongs = async () => {
        const table = await getPlaylistSongsTable();
        setPlaylistSongs(table);
    }

    const loadSongs = async () => {
        const table = await getSongsFromPlaylist(idNumber);
        setSongs(table);
    }

    useEffect(() => {
        createPlaylistSongsTable();
        loadPlaylistSongs();
        loadSongs();
    }, [])

    /** Set Header */
    useLayoutEffect(() => {
        navigation.setOptions({
            title: `Playlist ${id}`,
            headerBackTitle: 'Back',
        });
    })

    const handleAddSong = async () => {
        await addSong();
        loadPlaylistSongs();
        closeSongs();
    }

    const addSong = async () => {
        console.log("Adding song!");
        selectedIds.forEach(async (songId) => {
            await insertPlaylistSongsTable(idNumber, songId);
        })

    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        })
    }

    const closeSongs = () => {
        setSelectedIds(new Set());
        setAddPlaylistSong(false);
        close();
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

    const playSong = () => {
        audioPlayer.play();
    }

    const pauseSong = () => {
        audioPlayer.pause();
    }

    const handleMenuAction = (itemId: string) => {
        if (itemId === 'add') {
            setSelectionMode(false); // if it was true, just set it to false
            setAddPlaylistSong(true);
            return;
        }

        if (itemId === 'delete') {
            setSelectionMode(true);
            close();
            return;
        }
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
            },
          ],
        });
      };

    return (
        <ScrollView>
            {/* Header */}
            <Header
                leftPress={() => {}}
                rightPress={open}
            />
            
            <View>
                {/* Big image here*/}

                {/* Selection mode for deleting*/}
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

                {/* Songs */}
                <View style={styles.songBox}>
                    {songs?.map((psong) => {
                        const isSelected = selectedIds.has(psong.id);
                        return (
                            <PlaylistSongCard
                                key={psong.id}
                                playlist={psong}
                                isSelected={isSelected}
                                onPress={() => 
                                    selectionMode 
                                    ? toggleSelect(psong.id) 
                                    : setAndPlay(psong.id)}
                            />
                       ) 
                    })}
                </View>
                    
                {/* BottomSheet for adding songs to playlist */}
                <BottomSheet
                    isVisible={isVisible}
                    onClose={closeSongs}
                    snapPoints={[0.8]}
                > 
                    {!addPlaylistSong &&
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
                    </View>
                    }


                    {addPlaylistSong && 
                    <View style={styles.bottomSheetBox}>
                        <View style={styles.bottomSheetButtonBox} >
                            <Button
                                onPress={handleAddSong}
                                disabled={selectedIds.size === 0}
                            >
                                Add Songs
                            </Button>

                            <Button
                                onPress={closeSongs}
                            >
                                Cancel
                            </Button>
                        </View>
                        <View style={styles.addSongBox}>
                            {songs.map((song) => {
                                const isSelected = selectedIds.has(song.id);

                                return (
                                    <TouchableOpacity
                                        key={song.id}
                                        onPress={() => toggleSelect(song.id)}
                                    >
                                        <View style={[
                                            styles.addSongContent, 
                                            isSelected && {borderWidth: 2, borderColor: selected}]}
                                            key={song.id}    
                                        >
                                            <Text>{song.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>}
                </BottomSheet>

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
  bottomSheetBox: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: 20,
  },
  bottomSheetButtonBox: {
    gap: 10
  },
  songBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  addSongBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20
  },
  addSongContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10, // this is for future when i add image in or something lmao
    padding: 10,
  }
});