import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import SunCalc from 'suncalc';

const deg = (rad) => rad * (180 / Math.PI);

const getTrack = (date, lat, lon) => {
  const hours = Array.from({ length: 25 }, (_, i) => i);
  return hours.map((h) => {
    const d = new Date(date);
    d.setHours(h, 0, 0, 0);
    const { azimuth, altitude } = SunCalc.getPosition(d, lat, lon);
    return {
      azimuth: (deg(azimuth) + 180) % 360, // convert to 0=N
      elevation: deg(altitude),
    };
  });
};

const useSunTracks = () => {
  const [location, setLocation] = useState(null);
  const [tracks, setTracks] = useState({ current: [], summer: [], winter: [] });
  const [currentSun, setCurrentSun] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const getLoc = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        if (!cancelled) {
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (e) {}
    };
    getLoc();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!location) return;
    const { latitude, longitude } = location;
    const now = new Date();
    const year = now.getFullYear();
    const summer = new Date(year, 11, 21); // Dec 21
    const winter = new Date(year, 5, 21);  // Jun 21

    setTracks({
      current: getTrack(now, latitude, longitude),
      summer: getTrack(summer, latitude, longitude),
      winter: getTrack(winter, latitude, longitude),
    });

    const posNow = SunCalc.getPosition(now, latitude, longitude);
    setCurrentSun({
      azimuth: (deg(posNow.azimuth) + 180) % 360,
      elevation: deg(posNow.altitude),
    });
  }, [location]);

  return { tracks, currentSun, location };
};

export default useSunTracks;
