import { StatusBar } from 'expo-status-bar';
import { Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Camera, CameraType } from 'expo-camera'
import { shareAsync } from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import { useEffect, useRef, useState } from 'react';
import CameraButton from './components/CameraButton';

export default function App() {
  let cameraRef = useRef()
  const [hasCameraPermission, setHasCameraPermission] = useState()
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState()
  const [photo, setPhoto] = useState()
  // 
  const [type, setType] = useState(CameraType.back)
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off)

  useEffect(()=> {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync()
      setHasCameraPermission(cameraPermission.status === 'granted')
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted')
    })()
  }, [])

  if(hasCameraPermission === undefined){
    return <Text>Requesting permissions...</Text>
  }else if(!hasCameraPermission){
    return <Text>No access to camera. Please change this in settings.</Text>
  }

  const takePicture = async () => {
    if(cameraRef){
      try{
        const data = await cameraRef.current.takePictureAsync()
        setPhoto(data.uri)
      }catch(err){
        console.log(err);
      }
    }
  }

  const savePhoto = async () => {
    if(photo){
      try{
        await MediaLibrary.createAssetAsync(photo)
        alert('Saved!')
        setPhoto(null);
      }catch(err){
        console.log(err);
      }
    }
  }  

  return (    
    <View style={styles.container}>
      {
        !photo ? (
          <Camera
            style={styles.camera}
            type={type}
            flashMode={flash}
            ref={cameraRef}
          >
            <View style={{ 
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 30
             }}>
              <CameraButton icon={'retweet'} onPress={()=>{
                setType(type === CameraType.back ? CameraType.front : CameraType.back)
              }} />
              <CameraButton 
                color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#f1f1f1'} 
                icon={'flash'} 
                onPress={() => {
                  setFlash(flash === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.on : Camera.Constants.FlashMode.off)
                }} 
              />
            </View>
          </Camera>
        ) : (
          <Image 
            source={{ uri: photo }} style={styles.camera}
          />
        )
      }
      
      <View>
        {
          photo ? (
            <View style={{ 
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 50
             }}>
              <CameraButton title={'Re-take'} icon='retweet' onPress={()=>setPhoto(null)} />
              <CameraButton title={'Save'} icon='check' onPress={savePhoto} />
            </View>
          ) : (
            <CameraButton title={'Take a picture'} icon='camera' onPress={takePicture} />
          )
        }        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingBottom: 20
  },
  camera: {
    flex: 1,
    borderRadius: 20
  }
});
