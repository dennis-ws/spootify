import { ScrollView } from '@/components/ui/scroll-view'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { StyleSheet } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { View } from '@/components/ui/view'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Settings() {
    const bottom = useBottomTabBarHeight();
    return (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: bottom }}
            showsVerticalScrollIndicator={false}
        >
            <SafeAreaView>
                <View style={styles.container}>
                    <ModeToggle/>
                    <ModeToggle/>
                </View>
            </SafeAreaView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: { 
        flexDirection: 'column',
        justifyContent: 'center', 
        padding: 10, 
        backgroundColor: 'green' 
    },    
})