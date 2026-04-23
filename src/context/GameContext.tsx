import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc, collection, query, deleteDoc, serverTimestamp, orderBy, limit, increment, getDoc } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: any;
}

interface Room {
  id: string;
  gameId: string;
  gameTitle: string;
  creatorId: string;
  creatorName: string;
  guestId?: string;
  status: 'waiting' | 'ready' | 'playing';
  bet: number;
  createdAt: any;
  gameData?: any;
}

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  gold: number;
  isRegistered: boolean;
  isVip?: boolean;
  wins?: number;
  losses?: number;
  totalMatches?: number;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: any;
}

interface MatchRecord {
  id: string;
  players: string[];
  gameTitle: string;
  winnerId: string;
  bet: number;
  createdAt: any;
}

interface AppStats {
  totalUsers: number;
  onlineUsers: number;
  totalGoldInCirculation: number;
  houseProfit: number;
  pvpFee: number;
  pvhFee: number;
}

interface GameContextType {
  gold: number;
  user: UserProfile | null;
  rooms: Room[];
  stats: AppStats | null;
  messages: ChatMessage[];
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addGold: (amount: number) => Promise<void>;
  removeGold: (amount: number) => Promise<void>;
  buyGold: (amount: number) => Promise<void>;
  withdrawGold: (amount: number) => Promise<void>;
  buyVip: () => Promise<void>;
  recordMatch: (match: MatchRecord) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  updateStats: (newStats: Partial<AppStats>) => Promise<void>;
  updateTransactionStatus: (transId: string, status: 'completed' | 'rejected') => Promise<void>;
  updateUserGoldAdmin: (userId: string, newGold: number) => Promise<void>;
  createRoom: (gameId: string, gameTitle: string, bet: number) => Promise<string>;
  deleteRoom: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  startGame: (roomId: string) => Promise<void>;
  getRoomsByGame: (gameId: string) => Room[];
  updateRoomData: (roomId: string, data: any) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gold, setGold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setIsAdmin(firebaseUser.email === 'makerdudu123@gmail.com');
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUser(data);
            setGold(data.gold);
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || 'Guerreiro anônimo',
              email: firebaseUser.email || '',
              gold: 1000,
              isRegistered: true,
              isVip: false,
              wins: 0,
              losses: 0,
              totalMatches: 0
            };
            setDoc(userDocRef, newUser);
            setUser(newUser);
            setGold(1000);
          }
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        setUser(null);
        setGold(0);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Global Stats
    const unsubStats = onSnapshot(doc(db, 'stats', 'global'), (docSnap) => {
      if (docSnap.exists()) setStats(docSnap.data() as AppStats);
      else {
        // Init stats if not exist
        setDoc(doc(db, 'stats', 'global'), { 
          totalUsers: 50, 
          onlineUsers: 12,
          totalGoldInCirculation: 50000,
          houseProfit: 5000,
          pvpFee: 10,
          pvhFee: 10
        });
      }
    });

    // Sync Rooms from Firestore
    const roomsQuery = query(collection(db, 'rooms'));
    const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
      const roomList: Room[] = [];
      snapshot.forEach((doc) => {
        roomList.push(doc.data() as Room);
      });
      setRooms(roomList);
    });

    // Sync Messages from Firestore
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgList: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgList.reverse());
    });

    return () => {
      unsubscribeAuth();
      unsubStats();
      unsubscribeRooms();
      unsubscribeMessages();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro ao entrar com Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;
    const msgId = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'messages', msgId), {
      userId: user.uid,
      username: user.username,
      text: text.trim(),
      createdAt: serverTimestamp()
    });
  };

  const addGold = async (amount: number) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { gold: gold + amount });
  };

  const removeGold = async (amount: number) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { gold: Math.max(0, gold - amount) });
  };

  const buyGold = async (amount: number) => {
    if (!user) return;
    const transId = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'transactions', transId), {
      id: transId,
      userId: user.uid,
      type: 'deposit',
      amount,
      status: 'completed',
      createdAt: serverTimestamp()
    });
    await addGold(amount);
    if (stats) {
       await updateDoc(doc(db, 'stats', 'global'), { 
         totalGoldInCirculation: (stats.totalGoldInCirculation || 0) + amount 
       });
    }
  };

  const withdrawGold = async (amount: number) => {
    if (!user || gold < amount) return;
    const transId = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'transactions', transId), {
      id: transId,
      userId: user.uid,
      type: 'withdrawal',
      amount,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    await removeGold(amount);
    if (stats) {
       await updateDoc(doc(db, 'stats', 'global'), { 
         totalGoldInCirculation: (stats.totalGoldInCirculation || 0) - amount 
       });
    }
  };

  const buyVip = async () => {
    if (!user || gold < 5000) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      isVip: true,
      gold: gold - 5000
    });
  };

  const recordMatch = async (matchData: MatchRecord) => {
    if (!user) return;
    
    // Check if match already recorded (idempotency)
    const matchRef = doc(db, 'matches', matchData.id);
    const existingMatch = rooms.find(r => r.id === matchData.id); // Not used for matches, but context
    
    // In a real app we'd check Firestore. For now, let's just use the ID.
    await setDoc(matchRef, {
      ...matchData,
      createdAt: serverTimestamp()
    });

    // Update user stats and distribute prizes
    const isWinner = matchData.winnerId === user.uid;
    const userDocRef = doc(db, 'users', user.uid);
    
    let prize = 0;
    if (isWinner && matchData.players.length > 1 && matchData.bet > 0) {
      // PvP Winner: receives 90% of the total pot (assuming 2 players both put matchData.bet)
      const feePercent = stats?.pvpFee || 10;
      const totalPot = matchData.bet * 2;
      prize = totalPot * ((100 - feePercent) / 100);
      
      await addGold(prize);
    }

    await updateDoc(userDocRef, {
      wins: (user.wins || 0) + (isWinner ? 1 : 0),
      losses: (user.losses || 0) + (isWinner ? 0 : 1),
      totalMatches: (user.totalMatches || 0) + 1
    });

    // Update House Profit from match
    if (stats) {
       let feeAmount = 0;
       if (matchData.players.length > 1) {
          const feePercent = stats.pvpFee || 10;
          const totalPot = matchData.bet * 2;
          feeAmount = totalPot * (feePercent / 100);
       } else {
          // PvH fee
          const feePercent = stats.pvhFee || 10;
          feeAmount = Math.abs(matchData.bet) * (feePercent / 100);
       }
       await updateDoc(doc(db, 'stats', 'global'), { 
         houseProfit: (stats.houseProfit || 0) + feeAmount,
         totalGoldInCirculation: (stats.totalGoldInCirculation || 0) - feeAmount
       });
    }
  };

  const updateStats = async (newStats: Partial<AppStats>) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'stats', 'global'), newStats);
  };

  const updateTransactionStatus = async (transId: string, status: 'completed' | 'rejected') => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'transactions', transId), { status });
  };

  const updateUserGoldAdmin = async (userId: string, newGold: number) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'users', userId), { gold: newGold });
  };
  
  const createRoom = async (gameId: string, gameTitle: string, bet: number = 0) => {
    if (!user) throw new Error("Você precisa estar logado!");
    
    if (bet > 0) {
      if (gold < bet) throw new Error("Ouro insuficiente para a aposta!");
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { gold: increment(-bet) });
    }

    const roomId = Math.random().toString(36).substr(2, 9);
    const newRoom: Room = {
      id: roomId,
      gameId,
      gameTitle,
      creatorId: user.uid,
      creatorName: user.username,
      status: 'waiting',
      bet,
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'rooms', roomId), newRoom);
    return roomId;
  };

  const deleteRoom = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && room.bet > 0 && room.creatorId === user?.uid) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { gold: increment(room.bet) });
    }
    await deleteDoc(doc(db, 'rooms', roomId));
  };

  const joinRoom = async (roomId: string) => {
    if (!user) throw new Error("Você precisa estar logado!");
    
    // Fetch room directly from Firestore to ensure we have the most recent state
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) throw new Error("Esta sala não existe mais.");
    const room = roomSnap.data() as Room;

    if (room.status !== 'waiting') throw new Error("Esta sala já está em jogo.");
    if (room.creatorId === user.uid) throw new Error("Você não pode entrar na sua própria sala.");

    if (room.bet > 0) {
      if (gold < room.bet) throw new Error("Ouro insuficiente para a aposta!");
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { gold: increment(-room.bet) });
    }

    await updateDoc(roomRef, {
      status: 'ready',
      guestId: user.uid
    });
  };

  const startGame = async (roomId: string) => {
    if (!user) return;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      status: 'playing'
    });
  };

  const getRoomsByGame = (gameId: string) => {
    return rooms.filter(r => r.gameId === gameId);
  };

  const updateRoomData = async (roomId: string, data: any) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { gameData: data });
  };

  return (
    <GameContext.Provider value={{ 
      gold, 
      user, 
      rooms, 
      stats,
      messages,
      loading, 
      isAdmin,
      loginWithGoogle, 
      logout, 
      addGold, 
      removeGold, 
      buyGold,
      withdrawGold,
      buyVip,
      recordMatch,
      sendMessage,
      updateStats,
      updateTransactionStatus,
      updateUserGoldAdmin,
      createRoom, 
      deleteRoom, 
      joinRoom, 
      startGame,
      getRoomsByGame,
      updateRoomData
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
