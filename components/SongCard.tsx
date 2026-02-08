import { TouchableOpacity, StyleSheet } from 'react-native'
import { View } from '@/components/ui/view'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { Song } from '@/lib/types'

interface SongCardProps {
  song: Song
  isSelected: boolean
  destructiveColor: string
  onPress: () => void
}

export function SongCard({ song, isSelected, destructiveColor, onPress }: SongCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[
        styles.card, 
        isSelected && { 
          backgroundColor: destructiveColor 
        }]}>
        <Image
          source={require('@/assets/images/icon.png')}
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
    backgroundColor: 'blue',
    borderRadius: 8,
    width: '80%',
    height: 100,
    gap: 20,
    padding: 10,
  },
})
