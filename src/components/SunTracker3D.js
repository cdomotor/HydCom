import React, { useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import useSunTracks from '../hooks/useSunTracks';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const SunTracker3D = ({ size = 250 }) => {
  const glViewRef = useRef();
  const { tracks, currentSun, location } = useSunTracks();
  const { heading, pitch, roll } = useDeviceOrientation();

  useEffect(() => {
    if (!glViewRef.current || !location) return;

    let animation;
    const init = async () => {
      const gl = await glViewRef.current.createContextAsync();
      const renderer = new Renderer({ gl });
      renderer.setSize(size, size);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      camera.position.set(0, -3, 1.5);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      scene.add(light);

      const hemisphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshLambertMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.2 })
      );
      scene.add(hemisphere);

      const makeTrack = (points, color) => {
        const geom = new THREE.BufferGeometry();
        const verts = points.map(({ azimuth, elevation }) => {
          const az = THREE.MathUtils.degToRad(azimuth);
          const el = THREE.MathUtils.degToRad(elevation);
          const x = Math.cos(el) * Math.sin(az);
          const y = Math.cos(el) * Math.cos(az);
          const z = Math.sin(el);
          return new THREE.Vector3(x, y, z);
        });
        geom.setFromPoints(verts);
        const mat = new THREE.LineBasicMaterial({ color });
        return new THREE.Line(geom, mat);
      };

      const summerLine = makeTrack(tracks.summer, 0xff8c00);
      const winterLine = makeTrack(tracks.winter, 0x1e90ff);
      const todayLine = makeTrack(tracks.current, 0x2ecc71);
      scene.add(summerLine);
      scene.add(winterLine);
      scene.add(todayLine);

      const animate = () => {
        animation = requestAnimationFrame(animate);
        // Apply device orientation
        const hRad = THREE.MathUtils.degToRad(-heading);
        const pRad = THREE.MathUtils.degToRad(pitch);
        const rRad = THREE.MathUtils.degToRad(roll);
        scene.rotation.set(pRad, rRad, hRad, 'ZYX');
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();

      return () => cancelAnimationFrame(animation);
    };

    const cleanup = init();
    return () => {
      cleanup && cleanup();
    };
  }, [location, size, heading, pitch, roll, tracks]);

  if (Platform.OS === 'web') {
    return <View style={{ height: size, width: size }} />;
  }

  return (
    <View style={{ height: size, width: size }}>
      <GLView style={{ flex: 1 }} ref={glViewRef} />
    </View>
  );
};

export default SunTracker3D;
