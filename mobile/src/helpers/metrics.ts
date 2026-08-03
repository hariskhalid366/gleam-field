import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
export const widthPixel = (value: number) => (width / BASE_WIDTH) * value;
export const heightPixel = (value: number) => (height / BASE_HEIGHT) * value;
export const fontPixel = (value: number) => Math.min(widthPixel(value), value * 1.2);
