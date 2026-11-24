import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text } from '@/components/AppText';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

type IconGlyph = NonNullable<ComponentProps<typeof MaterialCommunityIcons>['name']>;

const tabLabels: Record<string, string> = {
  home: 'Home',
  farm: 'Kebun saya',
  products: 'Produk',
  chat: 'Chat',
  profile: 'Profile',
};

const tabIcons: Record<'home' | 'farm' | 'products' | 'chat' | 'profile', IconGlyph> = {
  home: 'home-variant-outline',
  farm: 'sprout-outline',
  products: 'shopping-outline',
  chat: 'message-text-outline',
  profile: 'account-outline',
};

export default function MainTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="farm" options={{ title: 'Lahan saya' }} />
      <Tabs.Screen name="products" options={{ title: 'Produk' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="complete-profile" options={{ href: null }} />
    </Tabs>
  );
}

function FloatingTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const c = useColors();
  const s = styles(c);
  return (
    <View pointerEvents="box-none" style={[s.dock, { bottom: insets.bottom + 12 }]}>
      <View style={s.bar}>
        {state.routes.map((route, index) => {
          const label = tabLabels[route.name];
          const iconName = tabIcons[route.name as keyof typeof tabIcons];
          if (!label || !iconName) return null;

          const focused = state.index === index;
          const color = focused ? c.primary : c.textSecondary;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={[s.item, focused ? s.activeItem : s.inactiveItem]}
            >
              <MaterialCommunityIcons name={iconName} size={23} color={color} />
              {focused ? <Text numberOfLines={1} style={s.activeLabel}>{label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  dock: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  bar: {
    width: '100%',
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    backgroundColor: c.surface,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: c.border,
    elevation: 12,
    shadowColor: '#183D2D',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
  },
  item: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 28 },
  activeItem: { flexGrow: 2.2, flexBasis: 0, gap: 6, paddingHorizontal: 8, backgroundColor: c.primarySoft, borderRadius: 999 },
  inactiveItem: { flexGrow: 0.7, flexBasis: 0 },
  activeLabel: { flexShrink: 1, color: c.primary, fontSize: 12, fontWeight: '800' },
});
