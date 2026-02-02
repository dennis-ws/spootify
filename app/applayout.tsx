// applayout.tsx
import { TouchableOpacity, Text } from 'react-native';
import { View } from '@/components/ui/view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 50
      }}
    >
      <SafeAreaView edges={['bottom']}>
        <TouchableOpacity
          style={{
            height: 64,
            backgroundColor: '#2563EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Now Playing
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
