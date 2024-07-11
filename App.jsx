import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  Viro3DObject,
  ViroAmbientLight
} from "@reactvision/react-viro";
import React, { useRef, useState,useEffect  } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PanResponder } from "react-native";
import { Platform } from "react-native";
const HelloWorldSceneAR = () => {
  // const [rotation1,setRotation1 ] = useState([0,0,0])
  
  const ARNodeRef = useRef(null);
  const [scale, setScale] = useState([1, 1, 1]);



  const handleError = (err) => {
    console.log("errorInLoading", err);
  };

  const handleStart = (err) => {
    // console.log("started",err)
  };

  const handleLoad = (err) => {
    // console.log("loaded",err)
  };

  const _onPinch = (pinchState, scaleFactor) => {
    // console.log(pinchState, 'pinchstate');
    // console.log(scaleFactor, 'scalefactor');
    let newScale = [
      scale[0] * scaleFactor,
      scale[1] * scaleFactor,
      scale[2] * scaleFactor,
    ];

    if (pinchState == 3) {
      setScale(newScale);
      return;
    }

    ARNodeRef.current.setNativeProps({ scale: newScale });
  };

  const [rotation, setRotation] = useState([0, 0, 0]);
  const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (event) => {
    // console.log(event)
  };
  const _onRotate = (rotateState, rotationFactor, source) => {
    if (rotateState === 3) {
      // Rotation gesture ended
      return;
    }
  
    // Calculate new rotation based on rotation factor
    const newRotationX = rotation[0] - rotationFactor;
    const newRotationY = rotation[1] - rotationFactor;
  
    // Update rotation using setNativeProps
    console.log(rotation)
    ARNodeRef.current.setNativeProps({ rotation: [newRotationX, newRotationY, rotation[2]] });
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />
            <Viro3DObject
        ref={ARNodeRef}
        source={{
          uri: 'https://raw.githubusercontent.com/saadxprt/hostfiles/main/2.glb',
        }}
        type="GLB"
        scale={scale}
        position={[0, 0, -55]}
        onLoadStart={handleStart}
        onLoadEnd={handleLoad}
        onError={handleError}
        onDrag={handleDrag}
        onPinch={_onPinch}
        rotation={rotation}
        onRotate={_onRotate} // Integrate onRotate handler
      />
    </ViroARScene>
  );
}

export default function App () {
  const [rotation, setRotation] = useState([0, 10, 0]);
  const ref = useRef(null);
  const [takingScreenshot, setTakingScreenshot] = useState(false);
  // idle --> recording --> idle
  const [recording, setRecording] = useState(false);


  const requestCameraRollPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) { // Android 13 or higher
          const resultImages = await request('android.permission.READ_MEDIA_IMAGES');
          const resultVideos = await request('android.permission.READ_MEDIA_VIDEO');
          if (resultImages === RESULTS.GRANTED && resultVideos === RESULTS.GRANTED) {
            console.log('Camera roll permission granted');
            return true;
          } else {
            console.log('Camera roll permission denied');
            return false;
          }
        } else {
          const result = await request('android.permission.WRITE_EXTERNAL_STORAGE');
          if (result === RESULTS.GRANTED) {
            console.log('Camera roll permission granted');
            return true;
          } else {
            console.log('Camera roll permission denied');
            return false;
          }
        }
      } else {
        const result = await request('photo');
        if (result === RESULTS.GRANTED) {
          console.log('Camera roll permission granted');
          return true;
        } else {
          console.log('Camera roll permission denied');
          return false;
        }
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  
  const handlePressTakeScreenshot = async () => {
    try {
      const cameraRollPermissionGranted = await requestCameraRollPermission();
      if (!cameraRollPermissionGranted) {
        console.log('Cannot take screenshot: Camera roll permission not granted');
        return;
      }
  
      setTakingScreenshot(true);
      const result = await ref.current?._takeScreenshot("test", true);
      console.log("image", result);
    } catch (e) {
      console.error("image", e);
    } finally {
      setTakingScreenshot(false);
    }
  };
  const handlePressRecordVideo = async () => {
    if (recording) {
      try {
        const result = await ref.current?.arSceneNavigator.stopVideoRecording();
        setRecording(false);
        console.log("[254]", result);
      } catch (e) {
        console.error("[254]", e);
      }
    } else {
      try {
        setRecording(true);
        const result = await ref.current?.arSceneNavigator.startVideoRecording(
          "test",
          true,
          (e) => {
            console.error("[254]", e);
          }
        );
        console.log("[254]", result);
      } catch (e) {
        console.error("[254]", e);
      }
    }
  };
 
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Reset previousAngle when starting gesture
      previousAngle = 0;
    },
    onPanResponderMove: (event, gestureState) => {
      // Calculate angle of touch movement
      const touchAngle = Math.atan2(
        gestureState.dy,
        gestureState.dx
      ) * (180 / Math.PI);

      // Calculate rotation based on touch movement
      const newRotation = [
        rotation[0],
        rotation[1] + (touchAngle - previousAngle), // Adjust rotation based on touch angle change
        rotation[2],
      ];

      // setRotation(newRotation);
      setRotation(() => newRotation ?? [])
      console.log(rotation,"rotation from parent")
      // Update previousAngle for next movement
      previousAngle = touchAngle;
    },
  });

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        ref={ref}
        autofocus={true}
        initialScene={{ scene: () => <HelloWorldSceneAR rotation={rotation} /> }}
        style={styles.arScene}
      />
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.button}
          disabled={takingScreenshot}
          onPress={handlePressTakeScreenshot}
        >
          <Text style={styles.buttonText}>
            {takingScreenshot ? "Taking" : "Take"} Screenshot
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePressRecordVideo}
        >
          <Text style={styles.buttonText}>
            {recording ? "Stop Recording" : "Record Video"}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={styles.controlButton}
        {...panResponder.panHandlers}
      >
        <Text style={styles.controlButtonText}>Rotate</Text>
      </View>
    </View>
  );
}

var styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 120,
    left: 30,
    right: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#00000088",
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
  },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});