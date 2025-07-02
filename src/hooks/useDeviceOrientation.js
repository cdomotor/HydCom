import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';

const radToDeg = (rad) => rad * (180 / Math.PI);

const useDeviceOrientation = () => {
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);

  useEffect(() => {
    let headingSub = null;
    let motionSub = null;
    let isMounted = true;

    const start = async () => {
      try {
        // Get heading updates
        headingSub = await Location.watchHeadingAsync((data) => {
          const current = data.trueHeading !== -1 ? data.trueHeading : data.magHeading;
          if (current !== -1 && isMounted) {
            setHeading(current);
          }
        });
      } catch (e) {
        // Ignore heading if unavailable
      }

      // Device motion for tilt
      DeviceMotion.setUpdateInterval(200);
      motionSub = DeviceMotion.addListener(({ rotation }) => {
        if (!rotation) return;
        if (isMounted) {
          setPitch(radToDeg(rotation.beta));
          setRoll(radToDeg(rotation.gamma));
        }
      });
    };

    start();

    return () => {
      isMounted = false;
      if (headingSub) headingSub.remove();
      if (motionSub) motionSub.remove();
    };
  }, []);

  return { heading, pitch, roll };
};

export default useDeviceOrientation;
