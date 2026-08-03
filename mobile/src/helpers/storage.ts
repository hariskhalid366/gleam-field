import { createMMKV } from 'react-native-mmkv';

export const Storage = createMMKV({
  id: 'com.pixelgenesys.martify',
  encryptionKey: 'b6310597be8adf8b571383633e3a1b2a3d46c2731c345719eb68d725fc82fb0cd4d79f123ad9fbe516decf86a1e777047923857f2242f25538a17378a2dfef54',
});

export const tokenStore = createMMKV({
  id: 'com.pixelgenesys.martify.token',
  encryptionKey: 'caf5a8b4cfa376d022115526a25661fe1a832efe7b0329b50c416618df39f94c',
});

export const mmkvStorage = {
  setItem: (key: string, value: any) => {
    Storage.set(key, value);
    return Promise.resolve(true)
  },
  getItem: (key: string) => {
    let value = Storage.getString(key);
    return Promise.resolve(value)
  },
  removeItem: (key: string) => {
    Storage.remove(key);
    return Promise.resolve()
  },
};
