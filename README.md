# [no.lol](https://www.no.lol)

[![Netlify Status](https://api.netlify.com/api/v1/badges/767c7e3a-f8ef-4f0f-9463-076318164ece/deploy-status)](https://app.netlify.com/sites/no-lol/deploys) [![Build Status](https://travis-ci.com/poteto/no.lol.svg?branch=master)](https://travis-ci.com/poteto/no.lol)

Lauren's personal blog. `master` is automatically deployed to Netlify.

## Image Pre-optimization

Gatsby already optimizes using `sharp`, but [recommends pre-optimizing images](https://www.gatsbyjs.org/docs/preoptimizing-images/) to improve build perf. Images in this repo tend to be stored at their highest relative quality so that `sharp` has the best quality image to generate multiple sizes with. However, this means that we tend to store large images which does increase build times quite heavily.

### Prerequisites

- [`convert`](https://imagemagick.org/script/download.php)
- [`mozjpeg`](https://github.com/mozilla/mozjpeg) (you will need to compile your own binaries. If you use MacOS, you can install with `brew install mozjpeg`)

### Running the script
Run the `yarn preoptimize:images` command whenever you add a new image. This will recursively look for jpgs in the specified folder, excluding images with the `-optimized.jpg` suffix.

The script will first convert the jpg into the `pnm` format (required by mozjpeg), then pipe the output into `cjpeg`. See usage [here](https://github.com/mozilla/mozjpeg/blob/master/usage.txt). We run `cjpeg` with the `-optimize` flag, then output the file to the same directory with the `-optimized.jpg` suffix.

Finally, reference the optimized jpg in your blog post.