import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  authApi,
  complaintApi,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
  userApi,
} from '../api/client.js';

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const cachedUser =
    getStoredUser();

  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    cachedUser || null
  );

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  /*
   * If we already have a cached user,
   * the app doesn't need to show a blank
   * screen while /auth/me validates it.
   */
  const [
    authReady,
    setAuthReady,
  ] = useState(
    Boolean(cachedUser)
  );

  const authEpoch =
    useRef(0);

  /*
   * Restore existing session.
   */
  useEffect(() => {
    let cancelled = false;

    const token =
      getAccessToken();

    if (!token) {
      setCurrentUser(null);
      setStoredUser(null);
      setAuthReady(true);
      return;
    }

    /*
     * If cached user exists, the UI is already
     * allowed to render.
     */
    if (getStoredUser()) {
      setAuthReady(true);
    }

    const validateSession =
      async () => {
        try {
          const result =
            await authApi.me();

          if (cancelled) {
            return;
          }

          setCurrentUser(
            result.user
          );

          setStoredUser(
            result.user
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          /*
           * Only destroy the session if the
           * server explicitly says it is invalid.
           *
           * Network problems must NOT log the
           * user out.
           */
          if (
            error?.status === 401 ||
            error?.status === 403
          ) {
            setAccessToken(
              null
            );

            setStoredUser(
              null
            );

            setCurrentUser(
              null
            );
          }
        } finally {
          if (!cancelled) {
            setAuthReady(true);
          }
        }
      };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =====================================================
     LOGIN
  ===================================================== */

  const login =
    useCallback(
      async (
        email,
        password
      ) => {
        const result =
          await authApi.login({
            email,
            password,
          });

        authEpoch.current += 1;

        /*
         * Save immediately.
         */
        setAccessToken(
          result.token
        );

        setStoredUser(
          result.user
        );

        setCurrentUser(
          result.user
        );

        setAuthReady(true);

        return result.user;
      },
      []
    );


  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout =
    useCallback(() => {
      authEpoch.current += 1;

      setAccessToken(
        null
      );

      setStoredUser(
        null
      );

      setCurrentUser(
        null
      );

      setComplaints([]);
    }, []);


  /* =====================================================
     SIGN UP
  ===================================================== */

  const signUp =
    useCallback(
      async (
        name,
        email,
        password
      ) => {
        const result =
          await authApi.signup({
            name,
            email,
            password,
          });

        return result.user;
      },
      []
    );


  /* =====================================================
     COMPLAINTS
  ===================================================== */

  const loadComplaints =
    useCallback(
      async () => {
        if (!currentUser) {
          return [];
        }

        const result =
          currentUser.role ===
          'admin'
            ? await complaintApi.all()
            : await complaintApi.mine();

        const next =
          result.complaints ||
          [];

        setComplaints(
          next
        );

        return next;
      },
      [currentUser]
    );


  const addComplaint =
    useCallback(
      async (body) => {
        const result =
          await complaintApi.create(
            body
          );

        setComplaints(
          (current) => [
            result.complaint,
            ...current,
          ]
        );

        return result.complaint;
      },
      []
    );


  const updateComplaint =
    useCallback(
      async (
        id,
        body
      ) => {
        const result =
          await complaintApi.update(
            id,
            body
          );

        setComplaints(
          (current) =>
            current.map(
              (item) =>
                String(
                  item.id
                ) ===
                String(id)
                  ? result.complaint
                  : item
            )
        );

        return result.complaint;
      },
      []
    );


  /* =====================================================
     PREMIUM
  ===================================================== */

  const upgradeToPremium =
    useCallback(
      async () => {
        const result =
          await userApi.upgrade();

        setCurrentUser(
          result.user
        );

        setStoredUser(
          result.user
        );

        return result.user;
      },
      []
    );


  const value =
    useMemo(
      () => ({
        currentUser,
        complaints,
        authReady,

        login,
        logout,
        signUp,

        loadComplaints,
        addComplaint,
        updateComplaint,

        upgradeToPremium,
      }),
      [
        currentUser,
        complaints,
        authReady,
        login,
        logout,
        signUp,
        loadComplaints,
        addComplaint,
        updateComplaint,
        upgradeToPremium,
      ]
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth =
  () => {
    const context =
      useContext(
        AuthContext
      );

    if (!context) {
      throw new Error(
        'useAuth must be used within AuthProvider'
      );
    }

    return context;
  };