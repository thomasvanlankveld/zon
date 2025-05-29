import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { type Meta, TARGET } from "../contexts/meta";

export default function getMeta(): Meta {
  if (!isTauri()) {
    return {
      target: TARGET.WEB,
    };
  }

  return {
    target: TARGET.DESKTOP,
    platform: platform(),
  };
}
