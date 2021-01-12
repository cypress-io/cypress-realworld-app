// @ts-check
const execa = require("execa");
const ffmpeg = require("ffmpeg-static");
const fs = require("fs");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const path = require("path");

/**
 * Finds the resolution of the video stream
 * @param {string} sourceVideo
 */
const getVideoResolution = async (sourceVideo) => {
  const { streams } = await ffprobe(sourceVideo, { path: ffprobeStatic.path });
  if (!streams) {
    throw new Error(`Did not find streams in ${sourceVideo}`);
  }
  if (!Array.isArray(streams)) {
    throw new Error(`Did not find streams array in ${sourceVideo}`);
  }
  if (streams.length !== 1) {
    throw new Error(`Expected a single video stream in ${sourceVideo}`);
  }
  const stream = streams[0];
  if (stream.codec_type !== "video") {
    throw new Error(`Expected video stream, got ${stream.codec_type}`);
  }
  return {
    width: stream.width,
    height: stream.height,
  };
};

/**
 * Replaces the given source video with its vintage encoding
 * @param {string} sourceVideo The input video (will be replaced)
 */
const toVintageVideo = async (sourceVideo) => {
  // transforms based on https://ottverse.com/create-vintage-videos-using-ffmpeg/
  // execa(ffmpeg, ["-i", sourceVideo, "-filter:v", "fps=fps=10", outputVideo]).then(

  const relativePath = path.relative(process.cwd(), sourceVideo);
  console.log("📺 Making %s look old school", relativePath);

  const { width, height } = await getVideoResolution(sourceVideo);

  // change the colors to look yellowish
  await execa(ffmpeg, [
    "-i",
    sourceVideo,
    "-vf",
    "curves=vintage",
    "-pix_fmt",
    "yuv420p",
    "-acodec",
    "copy",
    "-y",
    "yellow.mp4",
  ]);

  // scale the old grain video mask to the output size
  await execa(ffmpeg, [
    "-i",
    "./old-grain.mp4",
    "-vf",
    `scale=${width}:${height},setsar=1:1`,
    "-pix_fmt",
    "yuv420p",
    "-y",
    "grain.mp4",
  ]);

  // combine scaled old grain video with vintage
  const params = [
    "-i",
    "grain.mp4",
    "-i",
    "yellow.mp4",
    "-filter_complex",
    // use the first grain video as alpha mask, looping it forever
    // limit the output by the shortest video which will be the "yellow.mp4"
    "[0]format=rgba,colorchannelmixer=aa=0.25,loop=-1:32767:0[fg];[1][fg]overlay=shortest=1[out]",
    "-map",
    "[out]",
    "-pix_fmt",
    "yuv420p",
    "-acodec",
    "copy",
    "-y",
    sourceVideo,
  ];
  // console.log("about to execute: %s %s", ffmpeg, params.join(" "));
  await execa(ffmpeg, params);

  fs.unlinkSync("grain.mp4");
  fs.unlinkSync("yellow.mp4");
  console.log("finished with %s", sourceVideo);
};

module.exports = { toVintageVideo, getVideoResolution };
