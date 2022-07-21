const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");

let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/consumer", async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }
   console.log(payload);
    res.json(payload);
});

app.post('/broadcast', async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

function handleTrackEvent(e, peer) {
    const stream = e.streams[0]
    // if (stream.getAudioTracks().length) console.log('Peer has audio stream.');
    // if (stream.getVideoTracks().length) console.log('Peer has video stream.');

    var outputTracks = []
    outputTracks = outputTracks.concat(stream.getAudioTracks());
    outputTracks = outputTracks.concat(stream.getVideoTracks());

    senderStream = new webrtc.MediaStream(outputTracks);
};


app.listen(8000, () => console.log('server started'));