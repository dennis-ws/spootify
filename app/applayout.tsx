// applayout.tsx
import { ReactNode } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { View } from '@/components/ui/view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {

  return (
    <View style={{ flex: 1 }}>
      {/* Main content */}
      {children}

      {/* Overlay button above bottom tabs */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute',
          bottom: 50, // distance from bottom
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 999,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#2563EB', // bna-ui blue
            paddingVertical: 16,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
          }}
          onPress={() => console.log('Floating button pressed!')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Click Me</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
