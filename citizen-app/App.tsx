import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, SafeAreaView } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

export default function App() {
  const [meshEnabled, setMeshEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Floody</Text>
        <View style={styles.meshToggle}>
          <Text style={styles.meshText}>Mesh Fallback</Text>
          <Switch value={meshEnabled} onValueChange={setMeshEnabled} />
        </View>
      </View>

      {meshEnabled && (
        <View style={styles.meshBanner}>
          <Text style={styles.meshBannerText}>⚠️ OFFLINE: Routing via Bluetooth Mesh (Node Count: 3)</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Mock Danger Zone rendering */}
        <Polygon
          coordinates={[
            { latitude: 28.61, longitude: 77.20 },
            { latitude: 28.62, longitude: 77.20 },
            { latitude: 28.62, longitude: 77.21 },
            { latitude: 28.61, longitude: 77.21 },
          ]}
          fillColor="rgba(255, 0, 0, 0.3)"
          strokeColor="rgba(255, 0, 0, 0.8)"
        />
        <Marker coordinate={{ latitude: 28.615, longitude: 77.205 }} title="You are here" />
      </MapView>

      <View style={styles.dashboard}>
        <Text style={styles.alertText}>🚨 HIGH RISK ZONE DETECTED</Text>
        <Text style={styles.instructionText}>Water level rising rapidly. Proceed to higher ground towards Safdarjung immediately.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  meshToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meshText: {
    marginRight: 8,
    fontWeight: '500',
    color: '#555',
  },
  meshBanner: {
    backgroundColor: '#ff9800',
    padding: 10,
    alignItems: 'center',
  },
  meshBannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  dashboard: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  alertText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#d32f2f',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  }
});
