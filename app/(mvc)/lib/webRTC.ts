// /lib/utils/webRTC.ts
// Utilitaires pour la gestion des connexions WebRTC

export type PeerConnection = RTCPeerConnection;

export interface RTCOptions {
  iceServers?: RTCIceServer[];
  mediaConstraints?: MediaStreamConstraints;
  onTrack?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate | null) => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

/**
 * Crée une connexion peer WebRTC et obtient le flux média local.
 * @param options - Options pour la connexion peer.
 * @returns Un objet contenant la connexion peer et le flux média local.
 */
export async function createPeerConnection(options: RTCOptions = {}): Promise<{
  peerConnection: PeerConnection;
  localStream: MediaStream | null;
}> {
  const iceServers = options.iceServers || DEFAULT_ICE_SERVERS;
  const mediaConstraints =
    options.mediaConstraints || DEFAULT_MEDIA_CONSTRAINTS;

  // Créer la connexion peer
  const peerConnection = new RTCPeerConnection({ iceServers });

  // Configurer les gestionnaires d'événements
  if (options.onTrack) {
    peerConnection.ontrack = (event) => {
      options.onTrack!(event.streams[0]);
    };
  }

  if (options.onIceCandidate) {
    peerConnection.onicecandidate = (event) => {
      options.onIceCandidate!(event.candidate);
    };
  }

  // Obtenir le flux média local
  let localStream: MediaStream | null = null;

  try {
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

    // Ajouter les pistes locales à la connexion peer
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream!);
    });
  } catch (error) {
    console.error("Erreur lors de l'accès aux périphériques média:", error);
  }

  return { peerConnection, localStream };
}

/**
 * Crée une offre WebRTC.
 * @param peerConnection - La connexion peer WebRTC.
 * @returns L'offre WebRTC.
 */
export async function createOffer(
  peerConnection: PeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return offer;
}

/**
 * Crée une réponse WebRTC.
 * @param peerConnection - La connexion peer WebRTC.
 * @param offer - L'offre WebRTC reçue.
 * @returns La réponse WebRTC.
 */
export async function createAnswer(
  peerConnection: PeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  return answer;
}

/**
 * Traite une réponse WebRTC.
 * @param peerConnection - La connexion peer WebRTC.
 * @param answer - La réponse WebRTC reçue.
 */
export async function handleAnswer(
  peerConnection: PeerConnection,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  if (peerConnection.signalingState !== "have-local-offer") {
    throw new Error(
      "La connexion peer n'est pas dans l'état correct pour recevoir une réponse"
    );
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

/**
 * Ajoute un candidat ICE à la connexion peer.
 * @param peerConnection - La connexion peer WebRTC.
 * @param candidate - Le candidat ICE.
 */
export function addIceCandidate(
  peerConnection: PeerConnection,
  candidate: RTCIceCandidate
): Promise<void> {
  return peerConnection.addIceCandidate(candidate);
}

/**
 * Déconnecte une connexion peer et arrête le flux média local.
 * @param peerConnection - La connexion peer WebRTC.
 * @param localStream - Le flux média local.
 */
export function disconnectPeer(
  peerConnection: PeerConnection,
  localStream: MediaStream | null
): void {
  // Arrêter tous les tracks du flux local
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }

  // Fermer la connexion peer
  peerConnection.close();
}

/**
 * Classe utilitaire pour gérer les connexions WebRTC.
 */
export class WebRTCUtils {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(private consultationId: string) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection.connectionState === "disconnected") {
        if (this.onConnectionClosed) {
          this.onConnectionClosed();
        }
      }
    };
  }

  public onLocalStream: ((stream: MediaStream) => void) | null = null;
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onConnectionClosed: (() => void) | null = null;
  public onError: ((error: string) => void) | null = null;
  public onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null;

  /**
   * Démarre la connexion WebRTC.
   * @param isInitiator - Indique si l'utilisateur est l'initiateur de l'appel.
   */
  public async startConnection(isInitiator: boolean) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream!);
      });

      if (isInitiator) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        // Envoyer l'offre au pair distant (via WebSocket ou serveur de signalisation)
      }
    } catch (error) {
      if (this.onError) {
        this.onError((error as Error).message);
      }
    }
  }

  /**
   * Ferme la connexion WebRTC.
   */
  public closeConnection() {
    this.peerConnection.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
  }

  /**
   * Active ou désactive l'audio.
   */
  public toggleAudio() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }

  /**
   * Active ou désactive la vidéo.
   */
  public toggleVideo() {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }
}
