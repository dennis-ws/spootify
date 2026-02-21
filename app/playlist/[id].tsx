import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { createTrackTable, insertTrackTable, getPlaylist, getTrackAsSong, updateTrackPosition, getSongsFromPid, getSongTable, getSong, deleteTrack, getTrack} from '@/lib/schema';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/lib/audioSound';
import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/useColor'
import { createTwoButtonAlert } from '@/components/ui/alert'
import { Header } from '@/components/Header'
import { Track, Song, Playlist } from '@/lib/types';
import { SongCard } from '@/components/SongCard';
import { Sheetmode } from '@/lib/types';
import { Image } from '@/components/ui/image'
import { GripVerticalIcon } from 'lucide-react-native'
import DraggableSongList from '@/components/DraggableList'
import { FlatList } from 'react-native'
import { NestableScrollContainer } from "react-native-draggable-flatlist"

const menuItems = [
  {id: 'add', title: 'Add playlist'},
  {id: 'delete', title: 'Delete playlists', destructive: true},
  {id: 'position', title: 'Edit song positions'}
]

export default function track() {
    const { playPlaylist, playSong, loopPlaylist, loop} = useAudioContext();
    const { id } = useLocalSearchParams();
    const idNumber = Number(id);
    const navigation = useNavigation();
    const {isVisible, open, close} = useBottomSheet();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [editMode, setEditMode] = useState<Sheetmode>('menu');
    const destructiveColor = useColor('destructive');
    const textColor = useColor('text');

    const [playlist, setPlaylist] = useState<Playlist>();
    const [Track, setTrack] = useState<Track[]>();
    const [psong, setPsongs] = useState<Song[]>([]);
    const [psongId, setPsongId] = useState<Set<number>>(new Set());
    const [songs, setSongs] = useState<Song[]>([]);
    const selected = useColor('green');

    const reload = async () => {
        await loadTrack();
        await loadSongs();
    }

    const loadTrack = async () => {
        const table = await getSongsFromPid(idNumber);
        setTrack(table);
        const ptable = await getTrackAsSong(idNumber);
        setPsongs(ptable);
        setPsongId(new Set(ptable.map((song) => song.id)))
    }

    const loadSongs = async () => {
        const table = await getSongTable();
        setSongs(table);
    }

    const loadPlaylist = async () => {
        const playlistInfo = await getPlaylist(idNumber);
        setPlaylist(playlistInfo);
    }

    useEffect(() => {
        async function init() {
            await createTrackTable();
            await loadPlaylist();
            await loadTrack();
            await loadSongs();
        }

        init();
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
        await loadTrack();
        closeSongs();
    }

    const addSong = async () => {
        console.log("Adding song!");
        let curLength = psong.length;
        for (const songId of selectedIds) {
            if (psongId.has(songId)) continue;

            await insertTrackTable(idNumber, songId, curLength);
            curLength += 1;
        }
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
        setEditMode('menu');
        close();
    }

    const setAndPlay = async (songId: number) => {
        try {
        const found = await getSong(songId);
        playSong(found);
        } catch (error) {
        console.error("Error setting and playing song: ", error);
        }
    }

    const handleMenuAction = (itemId: string) => {
        if (itemId === 'add') {
            setSelectionMode(false); // if it was true, just set it to false
            setEditMode(itemId);
            return;
        }

        if (itemId === 'delete') {
            setSelectionMode(true);
            close();
            return;
        }

        if (itemId === 'position') {
            setSelectionMode(false);
            setEditMode('position');
            return;
        }
    }

    const handleDelete = async () => {
        console.log('Deleting songs with IDS: ', Array.from(selectedIds));

        for (const sid of selectedIds) {
            await deleteTrack(sid, idNumber);
        }

        reload();
        setSelectedIds(new Set());
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
              onPress: handleDelete 
            },
          ],
        });
      };

    const handleBack = async () => {
        setEditMode('menu');
    }

    const handleReorder = async (reordered: Song[]) => {
        try {
            for (let i = 0; i < reordered.length; i++) {
                const song = reordered[i];
                await updateTrackPosition(idNumber, song.id, i);

            }
        } catch (error) {
            console.log("Failed to reorder playlist", error);
        }
        reload();
    }

        const handleImage = () => {
        return (
            playlist?.image ??
            psong.find(song => song.image)?.image
        )
    }

    const handlePlay = () => {
        playPlaylist(psong);
    }

    return (
        <>
        <NestableScrollContainer>
            <View>
                {/* Header */}
                <Header
                    image={handleImage()}
                    playTrack={handlePlay}
                    loopPlaylist={loopPlaylist}
                    isLooping={loop}
                    heading={`${playlist?.name}`}
                    leftPress={() => {}}
                    rightPress={open}
                />
            </View>
            
            <View>
                {/* Big image here*/}
            </View>
            <View>
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
            </View>

            <View>
                {/* Songs */}
                <View style={styles.songBox}>
                    {Track?.map((psong) => {
                        const isSelected = selectedIds.has(psong.id);
                        return (
                            <SongCard
                                key={psong.id}
                                song={psong}
                                isSelected={isSelected}
                                destructiveColor={destructiveColor}
                                onPress={() => 
                                    selectionMode 
                                    ? toggleSelect(psong.id) 
                                    : setAndPlay(psong.id)}
                            />
                       )
                    })}
                </View>
            </View>
        </NestableScrollContainer>
        {/* BottomSheet for adding songs to playlist */}
                <BottomSheet
                    isVisible={isVisible}
                    onClose={closeSongs}
                    snapPoints={[0.8]}
                > 
                    {editMode === 'menu' &&
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


                    {editMode === 'add' && 
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

                    {editMode === 'position' &&
                    <View style={styles.bottomSheetBox}>
                        <View style={styles.bottomSheetButtonBox}>
                            <Button
                                onPress={handleBack}
                            >
                                Go back
                            </Button>
                        </View>
                        
                        {editMode === 'position' && (
                        <DraggableSongList
                            data={psong}
                            onReorder={handleReorder}
                        />
                        )}
                    </View>}
                </BottomSheet>

        </>
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
  },
  positionSongBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10,
    backgroundColor: 'red'
  },
    positionSongContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    gap: 12,
    },
    positionTextBox: {
        flex: 1,
        minWidth: 0,
    },
});