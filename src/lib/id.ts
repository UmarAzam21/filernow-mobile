// nativeApp\src\lib\id.ts

import { randomUUID } from "expo-crypto";

export const newId = () => randomUUID();