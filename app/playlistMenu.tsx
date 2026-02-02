import { BottomSheet, useBottomSheet} from '@/components/ui/bottom-sheet';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';

export default function PlaylistMenu(menuVisible, menuClose) {
    const {open} = useBottomSheet();
    
    return (
        <BottomSheet 
            isVisible={menuVisible} 
            onClose={menuClose}
            snapPoints={[0.4]}
        >
            <View style={{ padding: 20 }}>
                <Text>Create a new Playlist</Text>
            </View>
        </BottomSheet>
    )
}