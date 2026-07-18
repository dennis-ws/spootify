import { StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Button } from '@/components/ui/button'
import { Search, Ellipsis, Play, Repeat } from 'lucide-react-native';
import { useState } from 'react'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { SearchBar } from '@/components/ui/searchbar'

interface HeaderProp {
    image?: string
    playTrack?: () => void
    loopPlaylist?: () => void
    onSearch?: (query: string) => void
    isLooping?: boolean
    heading: string
    rightPress: () => void
    leftPress: () => void
}

export function Header({image, playTrack, loopPlaylist, onSearch, isLooping, heading, leftPress, rightPress}: HeaderProp) {
    const [searchMode, setSearchMode] = useState(false);
    const [query, setQuery] = useState<string>('');

    const handleSearch = () => {
        if (onSearch) {
            onSearch(query.trim());
        }
    };

    const handleCancel = () => {
        setSearchMode(false);
        setQuery('');
        onSearch?.('');
    };

    return (
    <View style={styles.header}>
        <View>
            {!searchMode && 
            <View style={styles.headerContent}>
                <Text variant="heading">{heading}</Text>

                <Button
                    icon={Search}
                    variant="secondary"
                    onPress={() => setSearchMode(true)}
                />
            </View>}
            {searchMode && 
            <View style={styles.searchContainer}>
                <View style={styles.searchBarContainer}>
                <SearchBar 
                    placeholder='Search for anything'
                    onChangeText={(text) => {
                        setQuery(text);
                        onSearch?.(text);
                        console.log("Searching for:", text);
                    }}
                    value={query}
                    onSearch={handleSearch}
                    showClearButton={true}
                />
                </View>
                <Button size='sm' variant='ghost' onPress={handleCancel}>Cancel</Button>
            </View>
            }
        </View>

        {/* Image */}
        {image && (
            <View style={styles.imageBox}>
                <Image
                    source={image ? {uri: image} : require('@/assets/images/icon.png')}
                    contentFit="cover"
                    width={360}
                    height={360}
                />
            </View>
        )}

        {/* Search and Setting buttons */}
        <View style={styles.headerButtons}>
            {/* Play Tracks if it exists*/}
            {playTrack && <Button icon = {Play} variant = 'secondary' onPress={playTrack}></Button>}

            {loopPlaylist && <Button icon = {Repeat} variant = 'secondary' style={{backgroundColor: isLooping ? '#22c55e' : undefined}}onPress={loopPlaylist}></Button>}

            <View style={{ flex: 1}}/>

            <Button icon={Ellipsis} variant='secondary' onPress={rightPress}></Button>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    header: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 32,
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
  imageBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchContainer: {
    flexDirection: 'row'
  },
  searchBarContainer: {
    flex: 1
  }
})