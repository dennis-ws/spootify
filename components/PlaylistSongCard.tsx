import { StyleSheet, TouchableOpacity } from 'react-native'
import { useColor } from '@/hooks/useColor'
import { View } from '@/components/ui/view'
import { Text } from '@/components/ui/text'
interface PlaylistSongProp {
    id: number
    title: string
    position: number | null
    file: string
}

interface PlaylistSongCardProp {
    playlist: PlaylistSongProp
    isSelected: boolean
    onPress: () => void
}

export function PlaylistSongCard({playlist, isSelected, onPress}: PlaylistSongCardProp) {
    const destructiveColor = useColor('destructive')

    return (
        <TouchableOpacity onPress={onPress}>
            <View
                style={[
                    styles.songCard,
                    isSelected && {padding: 10, borderWidth: 2, borderColor: destructiveColor}
                ]}
            >
                <Text>{playlist.title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 8,
        height: 100,
        gap: 20,
    }
})