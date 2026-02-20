import { StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Button } from '@/components/ui/button'
import { Search, Ellipsis } from 'lucide-react-native';
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Text } from '@/components/ui/text'


interface HeaderProp {
    playPlaylist?: () => void | null
    heading: string
    rightPress: () => void
    leftPress: () => void
}

export function Header({playPlaylist, heading, leftPress, rightPress}: HeaderProp) {
    
    return (
    <View style={styles.header}>
        <View style={styles.headerContent}>
            <Text variant='heading'>{`${heading}`}</Text>

            <ModeToggle />
        </View>

        {/* Search and Setting buttons */}
        <View style={styles.headerButtons}>
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
})