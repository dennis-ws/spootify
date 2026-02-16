import { TouchableOpacity, StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { PlaylistCardProps } from '@/lib/types'

export function PlaylistCard({
  playlist,
  isSelected,
  onPress,
  onLongPress,
  destructiveColor,
}: PlaylistCardProps) {
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
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
          source={playlist.image ? {uri: playlist.image} : require('@/assets/images/icon.png')}
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