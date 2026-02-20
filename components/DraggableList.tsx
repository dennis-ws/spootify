import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native'
import { View } from '@/components/ui/view'
import { Image } from '@/components/ui/image'
import { Text } from '@/components/ui/text'
import { GripVerticalIcon } from 'lucide-react-native'
import { Song, DraggableSongListProps } from '@/lib/types'

import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist'

export default function DraggableSongList({
  data,
  onReorder,
}: DraggableSongListProps) {

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Song>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={150}
          disabled={isActive}
          style={[
            styles.positionSongContent,
            { backgroundColor: isActive ? "#d1d1d1" : "#f2f2f2"}
          ]}
        >
          <Image
            source={item.image ? {uri: item.image} : require('@/assets/images/icon.png')}
            contentFit="cover"
            width={50}
            height={50}
            style={{ flex: 1 }}
          />
          <Text numberOfLines={1} style={styles.label}>
            {item.title}
          </Text>
        </TouchableOpacity>
      </ScaleDecorator>
    )
  }

  return (
    <DraggableFlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      onDragEnd={({ data }) => onReorder(data)}
      scrollEnabled={false}
    />
  )
}


const styles = StyleSheet.create({
    positionSongBox: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: 'red'
    },  
    positionSongContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: "#000"
    }
})