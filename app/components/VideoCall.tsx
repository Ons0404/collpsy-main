"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { User, Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import io from "socket.io-client";

interface VideoCallProps {
  roomId: number;
  userId: number;
  userRole: "student" | "psychologist";
  etudiantId: number;
  psychologueId: number;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  roomId,
  userId,
  userRole,
  etudiantId,
  psychologueId,
  onEndCall,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>(
    "Initialisation de la connexion..."
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [mediaPermissionDenied, setMediaPermissionDenied] =
    useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(false);

  const peerConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Fonction de journalisation
  const log = (message: string) => {
    console.log(`[VideoCall ${userRole}] ${message}`);
  };

  // Initialisation du flux média
  const initMediaStream = async () => {
    try {
      log("Demande d'accès aux médias...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      initSocketConnection();
    } catch (error) {
      log(`Erreur d'accès aux médias: ${error}`);
      setMediaPermissionDenied(true);
      setConnectionStatus("Permission requise pour la caméra et le microphone");
    }
  };

  // Initialisation de la connexion Socket.IO
  const initSocketConnection = () => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      log("Connecté au serveur de signalisation");
      joinRoom();
    });

    socket.on("user-joined", handleUserJoined);
    socket.on("webrtc-message", handleWebRTCMessage);
    socket.on("user-left", handleUserLeft);
    socket.on("disconnect", handleSocketDisconnect);
  };

  const joinRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("join-room", {
        roomId,
        userId,
        userRole,
      });
      setConnectionStatus("En attente de l'autre participant...");
    }
  };

  const handleUserJoined = (data: { userId: number; userRole: string }) => {
    log(`Utilisateur ${data.userId} (${data.userRole}) a rejoint`);
    setConnectionStatus("Connexion établie, démarrage de l'appel...");
    if (userRole === "psychologist") {
      createPeerConnection();
    }
  };

  const createPeerConnection = () => {
    if (!localStream) {
      log("Erreur: Aucun flux local disponible");
      return;
    }

    try {
      const pc = new RTCPeerConnection(peerConfiguration);
      peerConnectionRef.current = pc;

      // Ajout des tracks locales
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Gestion des candidats ICE
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc-message", {
            type: "ice-candidate",
            candidate: event.candidate,
            toId: userRole === "psychologist" ? etudiantId : psychologueId,
            roomId,
          });
        }
      };

      // Réception du flux distant
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Création de l'offre pour le psychologue
      if (userRole === "psychologist") {
        createOffer(pc);
      }
    } catch (error) {
      log(`Erreur création PeerConnection: ${error}`);
    }
  };

  const createOffer = async (pc: RTCPeerConnection) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit("webrtc-message", {
          type: "offer",
          offer,
          toId: etudiantId,
          roomId,
        });
      }
    } catch (error) {
      log(`Erreur création offre: ${error}`);
    }
  };

  const handleWebRTCMessage = async (message: any) => {
    if (!peerConnectionRef.current) return;

    try {
      switch (message.type) {
        case "offer":
          await handleOffer(message);
          break;
        case "answer":
          await handleAnswer(message);
          break;
        case "ice-candidate":
          await handleIceCandidate(message);
          break;
      }
    } catch (error) {
      log(`Erreur traitement message: ${error}`);
    }
  };

  const handleOffer = async (message: any) => {
    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(message.offer)
    );

    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);

    if (socketRef.current) {
      socketRef.current.emit("webrtc-message", {
        type: "answer",
        answer,
        toId: message.fromId,
        roomId,
      });
    }
  };

  const handleAnswer = async (message: any) => {
    if (peerConnectionRef.current && message.answer) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(message.answer)
      );
    }
  };

  const handleIceCandidate = async (message: any) => {
    if (peerConnectionRef.current && message.candidate) {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(message.candidate)
      );
    }
  };

  const handleUserLeft = () => {
    setConnectionStatus("L'autre participant a quitté l'appel");
    setRemoteStream(null);
    cleanupPeerConnection();
  };

  const handleSocketDisconnect = () => {
    setConnectionStatus("Déconnecté du serveur");
    cleanup();
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room", { roomId, userId });
      socketRef.current.disconnect();
    }
    cleanup();
    onEndCall();
  };

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const cleanupMediaStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
  };

  const cleanup = () => {
    cleanupPeerConnection();
    cleanupMediaStream();
  };

  useEffect(() => {
    isMountedRef.current = true;
    initMediaStream();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      {/* Masquer les informations sensibles */}
      <div className="bg-gray-100 p-3 rounded-md">
        <p className="text-sm">
          Statut: <span className="font-medium">{connectionStatus}</span>
        </p>

        {mediaPermissionDenied && (
          <div className="mt-2">
            <Button onClick={initMediaStream} variant="outline">
              Autoriser l'accès
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flux local */}
        <Card>
          <CardContent className="p-0 relative overflow-hidden rounded-md">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-black object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              Vous
            </div>
          </CardContent>
        </Card>

        {/* Flux distant */}
        <Card>
          <CardContent className="p-0 relative overflow-hidden rounded-md h-64 bg-gray-900">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <User size={48} className="mx-auto mb-2" />
                  <p>{connectionStatus}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          onClick={toggleAudio}
          className={`rounded-full ${
            !isAudioEnabled ? "bg-red-500 text-white" : ""
          }`}
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>

        <Button
          variant="outline"
          onClick={toggleVideo}
          className={`rounded-full ${
            !isVideoEnabled ? "bg-red-500 text-white" : ""
          }`}
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>

        <Button
          variant="outline"
          onClick={endCall}
          className="rounded-full bg-red-500 text-white"
        >
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
