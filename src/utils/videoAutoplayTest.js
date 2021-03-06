/*
The MIT License (MIT)
Copyright (c) 2016
Faruk Ates
Paul Irish
Alex Sexton
Ryan Seddon
Patrick Kettner
Stu Cox
Richard Herrera

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const DEBUG = false;

const RETRIES = 5;
const WAITTIME = 200; //ms
const { OggVideo, Mp4Video } = require('../constants/videoTestBlobs');

const VideoAutoplayTest = () => {
  return new Promise((resolve, reject) => {
    if (DEBUG === 'resolve') {
      resolve(true);
      return;
    } else if (DEBUG === 'reject') {
      reject('rejected for debugging');
      return;
    }

    const elem = document.createElement('video');
    const elemStyle = elem.style;

    let currentTry = 0;
    let timeout;

    const testAutoplay = (evt) => {
      currentTry++;
      clearTimeout(timeout);

      const canAutoPlay = evt && evt.type === 'playing' || elem.currentTime !== 0;

      if (!canAutoPlay && currentTry < RETRIES) {
        timeout = setTimeout(testAutoplay, WAITTIME);
        return;
      }

      elem.removeEventListener('playing', testAutoplay, false);
      if (canAutoPlay) {
        resolve(canAutoPlay);
      } else {
        reject('no autoplay: browser does not support autoplay');
      }
      elem.parentNode.removeChild(elem);
    };

    // skip the test if the autoplay isn't supported on `video` elements
    if (!('autoplay' in elem)) {
      reject('no autoplay: browser does not support autoplay attribute');
      return;
    }

    elemStyle.cssText = 'position: absolute; height: 0; width: 0; overflow: hidden; visibility: hidden; z-index: -100';

    try {
      if (elem.canPlayType('video/ogg; codecs="theora"').match(/^(probably)|(maybe)/)) {
        elem.src = OggVideo;
      } else if (elem.canPlayType('video/mp4; codecs="avc1.42E01E"').match(/^(probably)|(maybe)/)) {
        elem.src = Mp4Video;
      } else {
        reject('no autoplay: element does not support mp4 or ogg format');
        return;
      }
    } catch (err) {
      reject('no autoplay: ' + err);
      return;
    }

    elem.setAttribute('autoplay', '');
    elem.setAttribute('muted', 'true');
    elem.style.cssText = 'display:none';
    document.body.appendChild(elem);
    // wait for the next tick to add the listener, otherwise the element may
    // not have time to play in high load situations (e.g. the test suite)
    setTimeout(() => {
      elem.addEventListener('playing', testAutoplay, false);
      timeout = setTimeout(testAutoplay, WAITTIME);
    }, 0);
  });
};

export default VideoAutoplayTest;
