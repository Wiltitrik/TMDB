import {  Text } from 'react-native'
import React from 'react'
import {  Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
  <Tabs>
    <Tabs.Screen name="index" options={{ title: "Accueil", tabBarIcon :({focused, color, size}) => {return <Text>🏠</Text>} }} />
    <Tabs.Screen name="movies/[id]" options={{ title: "Film" }} />
    <Tabs.Screen name="Recherche" options={{ title: "Recherche", tabBarIcon :({focused, color, size}) => {return <Text>🔍</Text>}  }} />
    <Tabs.Screen name="Favoris" options={{ title: "Favoris", tabBarIcon :({focused, color, size}) => {return <Text>⭐</Text>} }} />
  </Tabs>
  )
}