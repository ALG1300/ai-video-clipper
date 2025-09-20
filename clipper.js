import { exec as _exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const exec = promisify(_exec);

export async function probeDuration(inputPath) {
  // ffprobe comes with ffmpeg package
  const cmd = `ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "${inputPath}"`;
  const { stdout } = await exec(cmd);
  return Math.floor(parseFloat(stdout.trim())); // seconds
}

export function evenClipStarts(totalSec, clipLen, count) {
  const usable = Math.max(totalSec - clipLen, 0);
  if (usable <= 0) return [0];
  const step = usable / (count + 1);
  return Array.from({ length: count }, (_, i) => Math.floor((i + 1) * step));
}

// Fast cut without re-encoding (copy), then re-encode to vertical 9:16
export async function cutSegment(input, start, duration, outPath) {
  // -ss before -i is fastest, but copy can sometimes cut at keyframes; for MVP it's fine
  const cmd = `ffmpeg -y -ss ${start} -i "${input}" -t ${duration} -c copy "${outPath}"`;
  await exec(cmd);
}

export async function toVertical916(input, outPath) {
  // Scale so height is 1920, preserve aspect, center-crop to 1080x1920
  const filter = [
    "scale=-2:1920",
    "crop=1080:1920:(in_w-1080)/2:0"
  ].join(",");

  const cmd = `ffmpeg -y -i "${input}" -filter:v "${filter}" -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 192k -movflags +faststart "${outPath}"`;
  await exec(cmd);
}
