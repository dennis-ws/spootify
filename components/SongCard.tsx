import { TouchableOpacity, StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { SongCardProps } from '@/lib/types'


export function SongCard({ song, isSelected, destructiveColor, onPress, onLongPress }: SongCardProps) {
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <View style={[
        styles.card, 
        isSelected && { 
          backgroundColor: destructiveColor 
        }]}>
        <Image
          source={song.image ? {uri: song.image} : require('@/assets/images/icon.png')}
          contentFit="cover"
          width={80}
          height={80}
          style={{ flex: 1 }}
        />
        <Text style={{ flex: 2 }}>{song.title}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    width: '80%',
    height: 100,
    gap: 20,
    padding: 10,
  },
})
