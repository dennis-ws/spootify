import { TouchableOpacity, StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'


interface Playlist {
  id: number
  name: string
}

interface PlaylistCardProps {
  playlist: Playlist
  isSelected: boolean
  onPress: () => void
  destructiveColor: string
}

export function PlaylistCard({
  playlist,
  isSelected,
  onPress,
  destructiveColor,
}: PlaylistCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.playlistContent,
          isSelected && {
            padding: 10,
            borderWidth: 2,
            borderColor: destructiveColor,
          },
        ]}
      >
        <Image
          source={require('@/assets/images/icon.png')}
          contentFit="cover"
          width={80}
          height={80}
        />
        <Text>{playlist.name}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    height: 100,
    gap: 20,
  },
})