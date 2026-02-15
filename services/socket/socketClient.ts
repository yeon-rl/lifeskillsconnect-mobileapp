import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://lsc-api.accordiaharmony.org';

class SocketClient {
  private socket: Socket | null = null;

  /**
   * Helper to retrieve and clean the auth token
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const userStorage = await AsyncStorage.getItem('user-storage');
      if (!userStorage) return null;

      const parsed = JSON.parse(userStorage);
      let token = parsed.state?.authToken || null;


      console.log('🔍 Socket Auth: Raw token from storage:', token);

      if (token && typeof token === 'string') {
        token = token.trim();
        // If the token mistakenly includes the Bearer prefix, strip it 
        // because the socket middleware verifies it directly.
        if (token.startsWith('Bearer ')) {
          token = token.substring(7);
        }
      }

      console.log('🔍 Socket Auth: Token retrieved and cleaned:', token);
      return token;
    } catch (error) {
      console.error('❌ Socket Auth: Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Connect to the Socket.IO server
   */
  async connect(extraAuth?: any): Promise<Socket> {
    // If already connected, just return the socket
    if (this.socket?.connected) {
      if (extraAuth) {
        this.socket.auth = { ...this.socket.auth, ...extraAuth };
      }
      return this.socket;
    }

    // Use token from extraAuth if provided, otherwise fetch from storage
    const token = extraAuth?.token || (await this.getAuthToken());
    
    console.log(`🔌 Attempting to connect to socket: ${SOCKET_URL} with token: ${token ? 'PROVIDED' : 'MISSING'}`);

    // If socket already exists but is disconnected, update auth and reconnect
    if (this.socket) {
      this.socket.auth = { ...extraAuth, token };
      this.socket.connect();
      return this.socket;
    }

    // Create new socket instance
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
        ...extraAuth,
      },
      reconnection: true,
      reconnectionAttempts: 10, // Increased for better resiliency
      reconnectionDelay: 1000,
      transports: ['polling', 'websocket'], // Allow polling fallback
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server at', SOCKET_URL);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      // Log more detail if it's an auth error
      if (error.message.includes('Authentication')) {
        console.error('   Verify if token format or environment (Local vs Prod) matches.');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO server:', reason);
    });

    return this.socket;
  }

  /**
   * Get the socket instance, creating a connection if needed
   */
  async getSocket(extraAuth?: any): Promise<Socket> {
    if (!this.socket || !this.socket.connected) {
      return await this.connect(extraAuth);
    }

    if (extraAuth) {
      this.socket.auth = { ...this.socket.auth, ...extraAuth };
    }

    return this.socket;
  }

  /**
   * Disconnect from the Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Emit an event to the server
   * @param event - Event name
   * @param data - Data to send
   */
  async emit(event: string, data: any): Promise<void> {
    const socket = await this.getSocket();
    socket.emit(event, data);
  }

  /**
   * Listen for an event from the server
   * @param event - Event name
   * @param callback - Callback function to handle the event
   */
  async on(event: string, callback: (data: any) => void): Promise<void> {
    const socket = await this.getSocket();
    socket.on(event, callback);
  }

  /**
   * Remove an event listener
   * @param event - Event name
   * @param callback - Optional specific callback to remove
   */
  async off(event: string, callback?: (data: any) => void): Promise<void> {
    const socket = await this.getSocket();
    socket.off(event, callback);
  }
}

const socketClient = new SocketClient();
export default socketClient;
