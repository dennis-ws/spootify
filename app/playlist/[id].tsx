import { ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { getPlaylistSongsTable, createPlaylistSongsTable, insertPlaylistSongsTable, getSongTable, insertPlaylist, getSong } from '@/lib/schema';
import { Ellipsis, Search } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/lib/audioSound';
import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/useColor'

export default function Playlist() {
    const audioPlayer = useAudioContext();
    const { id } = useLocalSearchParams();
    const idNumber = Number(id);
    const navigation = useNavigation();
    const {isVisible, open, close} = useBottomSheet();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());


    const [playlistSongs, setPlaylistSongs] = useState<any[]>();
    const [songs, setSongs] = useState<any[]>([]);
    const selected = useColor('green');

    const loadPlaylistSongs = async () => {
        const table = await getPlaylistSongsTable();
        setPlaylistSongs(table);
    }

    const loadSongs = async () => {
        const table = await getSongTable();
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

    return (
        <ScrollView>
            {/* Header */}
            <View style={styles.header}>

                {/* Search and Setting buttons */}
                <View style={styles.headerButtons}>
                    <Button icon={Search} variant='secondary' onPress={() => {}}></Button>

                    <Button icon={Ellipsis} variant='secondary' onPress={open}></Button>
                </View>
            </View>
            <View>
                {/* Big image here*/}

                {/* Songs */}
                <View>
                    {songs?.map((psong) => {
                        console.log(psong);

                        return (
                            <TouchableOpacity 
                                key={psong.id}
                                onPress={() => setAndPlay(psong.id)}
                            >
                                <View>
                                    <Text>{psong.title}</Text>
                                </View>
                            </TouchableOpacity>
                       ) 
                    })}
                </View>
                    
                {/* BottomSheet for adding songs to playlist */}
                <BottomSheet
                    isVisible={isVisible}
                    onClose={closeSongs}
                    snapPoints={[0.8]}
                > 
                    <View
                        style={styles.bottomSheetBox}
                    >
                        <View
                            style={styles.bottomSheetButtonBox}
                        >
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
                                            isSelected && {borderWidth: 2, borderColor: selected}]}>
                                            <Text>{song.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
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