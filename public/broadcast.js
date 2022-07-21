var URL = window.URL || window.webkitURL

window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }

    var playSelectedFile = function () {
        var file = this.files[0]
        var videoNode = document.getElementById('bigchek-video')
        var fileURL = URL.createObjectURL(file)
        videoNode.src = fileURL
    }

    var inputNode = document.getElementById("input")
    inputNode.addEventListener('change', playSelectedFile, false)
    
}

async function init() {

    var myVideo = document.getElementById("bigchek-video")
    const stream = myVideo.captureStream()
    // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    // if (stream.getAudioTracks().length) alert('Peer has audio stream.');
    // if (stream.getVideoTracks().length) alert('Peer has video stream.');
}


function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}


