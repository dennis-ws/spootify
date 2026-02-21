import { StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Button } from '@/components/ui/button'
import { Search, Ellipsis } from 'lucide-react-native';
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'

interface HeaderProp {
    image?: string
    playTrack?: () => void
    heading: string
    rightPress: () => void
    leftPress: () => void
}

export function Header({image, playTrack, heading, leftPress, rightPress}: HeaderProp) {
    
    return (
    <View style={styles.header}>
        <View style={styles.headerContent}>
            <Text variant='heading'>{`${heading}`}</Text>

            <ModeToggle />
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
            {playTrack && <Button variant = 'secondary' onPress={playTrack}>Play</Button>}

            <View style={{ flex: 1}}/>

            <Button icon={Search} variant='secondary' onPress={leftPress}></Button>

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
  }
})