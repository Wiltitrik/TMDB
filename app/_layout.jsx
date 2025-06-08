import React from 'react'
import { Link, Slot, Stack } from 'expo-router'
import { View, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
    return (
        <GestureHandlerRootView>
            <Stack screenOptions={{
                headerStyle: {
                    backgroundColor: "cyan",
                },
            }}>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="(drawer)" />
            </Stack>
        </GestureHandlerRootView>
    )
}
