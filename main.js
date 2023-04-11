let APP_ID = "03640d942a114c11b936bed0fc42322d" 


let token = null;
let uid = String(Math.floor(Math.random() * 10000))

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;


const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}
  
let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})

    //index.html?room=234234
    channel = client.createChannel('main')
    await channel.join()


    channel.on('MemberJoined', handleUserJoined)


    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    document.getElementById('user-1').srcObject = localStream
    
    createOffer()
}

let handleUserJoined = async (MemberID) => {
    console.log('A new user is joined the channel:', MemberID)
}

let createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track,localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            console.log('New ICE candidate:', event.candidate)
        }
    } 

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    
    console.log('Offer:', offer)
}
init() 