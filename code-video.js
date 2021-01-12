const execa = require("execa");
const ffmpeg = require("ffmpeg-static");
const sourceVideo = "./cypress/videos/ui/user-settings.spec.ts.mp4";
const outputVideo = "out.mp4";

// transforms based on https://ottverse.com/create-vintage-videos-using-ffmpeg/
// execa(ffmpeg, ["-i", sourceVideo, "-filter:v", "fps=fps=10", outputVideo]).then(

// change the colors to look yellowish
execa(ffmpeg, [
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
])
  .then(() => {
    // scale the old grain video mask to the output size
    return execa(ffmpeg, [
      "-i",
      "./old-grain.mp4",
      "-vf",
      // TODO do not hardcode the video dimensions
      "scale=1280:720,setsar=1:1",
      "-pix_fmt",
      "yuv420p",
      "-y",
      "grain.mp4",
    ]);
  })
  .then(() => {
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
      outputVideo,
    ];
    console.log("about to execute: %s %s", ffmpeg, params.join(" "));
    return execa(ffmpeg, params);
  })
  .then(
    () => {
      console.log("done");
    },
    (e) => {
      console.error(e);
      process.exit(1);
    }
  );

// good (copy)
// Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661),
// yuvj420p(pc), 1280x720[SAR 1: 1 DAR 16: 9],
// 130 kb / s, 25 fps, 25 tbr, 12800 tbn, 50 tbc(default )

// bad
// Stream #0:0(und): Video: h264 (High 4:4:4 Predictive)
// (avc1 / 0x31637661), yuv444p, 1280x720[SAR 1: 1 DAR 16: 9],
// 199 kb / s, 25 fps, 25 tbr, 12800 tbn, 50 tbc(default )
