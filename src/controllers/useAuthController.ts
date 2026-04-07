import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authModel } from "@/models/authModel";

export function useAuthController() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [defaultStoreId, setDefaultStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await authModel.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);
      const isAdmin = await authModel.isPlatformAdmin(user.id);
      if (isAdmin) {
        setIsPlatformAdmin(true);
      } else {
        const storeId = await authModel.getStoreAdminStoreId(user.id);
        if (storeId) setDefaultStoreId(storeId);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await authModel.signOut();
    navigate("/login");
  };

  return { user, isPlatformAdmin, defaultStoreId, loading, handleSignOut };
}
