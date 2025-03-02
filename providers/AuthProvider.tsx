import { axiosInstance } from "@/lib/axios.ts";
import { useAuthStore } from "@/stores/useAuthStore.ts";
import { useChatStore } from "@/stores/useChatStore.ts";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
//import { spotify1 } from "/public/spotify1.png";

const updateApiToken = (token: string | null) => {
    if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken, userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const { checkAdminStatus } = useAuthStore();
    const { initSocket, disconnectSocket } = useChatStore();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken();
                updateApiToken(token);
                if (token) {
                    await checkAdminStatus();
                    // init socket
                    if (userId) initSocket(userId);
                }
            } catch (error: any) {
                updateApiToken(null);
                console.log("Error in auth provider", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // clean up
        return () => disconnectSocket();
    }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket]);

    if (loading)
        return (
            <div className='h-screen w-full flex flex-col items-center justify-center bg-background'>

                <img src="spotify1.png" className="w-90 h-90 mb-3" />
                <Loader className='size-10  text-orange-600 animate-spin' />
            </div>
        );/*
    if (loading)
        return (
            <div className='h-screen w-full flex flex-col items-center justify-center bg-background'>
                <img src="spotify1.png" className="w-90 h-90 mb-3" />
                <Loader className='size-14 text-orange-600 animate-spin' />
            </div>
        );*/


    return <>{children}</>;
};
export default AuthProvider;