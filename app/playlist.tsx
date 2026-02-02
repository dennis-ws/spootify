import { ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';


export default function Playlist() {
    return (
        <ScrollView>
            <View>
                <Text>This is not in a directory</Text>
            </View>
        </ScrollView>
    );
}