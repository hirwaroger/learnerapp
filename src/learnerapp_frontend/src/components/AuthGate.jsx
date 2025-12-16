import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { learnerapp_backend, createActor, canisterId } from 'declarations/learnerapp_backend';

const AuthGate = ({ api, onLogin }) => {
  const [authMode, setAuthMode] = useState('user');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authClient, setAuthClient] = useState(null);

  useEffect(() => {
    initAuthClient();
  }, []);

  const initAuthClient = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
    } catch (err) {
      setError('Failed to initialize auth client: ' + err.message);
    }
  };

  const handleAdminLogin = async () => {
    if (!authClient) {
      setError('Auth client not initialized');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const internetIdentityUrl = import.meta.env.PROD
        ? undefined
        : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

      await new Promise((resolve) => {
        authClient.login({
          identityProvider: internetIdentityUrl,
          onSuccess: () => resolve(undefined),
          onError: (err) => {
            setError('Login failed: ' + err);
            setIsLoading(false);
          }
        });
      });

      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();

      console.log('Principal:', principal.toString());

      // Create actor with the authenticated identity
      const actor = createActor(canisterId, {
        agentOptions: { identity }
      });

      // Check if already admin
      let isAdmin = await actor.isAdmin(principal);
      
      if (!isAdmin) {
        // Try to become admin
        const setAdminResult = await actor.setAdmin(principal);
        if (!setAdminResult) {
          setError('Admin already exists. You are not authorized.');
          await authClient.logout();
          return;
        }
      }

      onLogin({ 
        principal: principal.toString(), 
        authClient: authClient,
        identity 
      }, 'admin', identity);

    } catch (error) {
      console.error('Admin login error:', error);
      setError('Authentication failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserLogin = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginResult = await learnerapp_backend.loginUser(userName.trim());
      
      if (loginResult) {
        onLogin({ name: userName.trim() }, 'user');
      } else {
        setError('Failed to login. Please try again.');
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome</h2>
            <p className="mt-2 text-sm text-gray-600">Choose your login method to continue</p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="mt-8 flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                authMode === 'user' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthMode('user')}
            >
              👤 Learner
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                authMode === 'admin' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthMode('admin')}
            >
              👑 Admin
            </button>
          </div>

          {/* Login Content */}
          <div className="mt-8">
            {authMode === 'user' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Learner Login</h3>
                  <p className="text-sm text-gray-600 mb-4">Enter your full name to access learning topics</p>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleUserLogin()}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUserLogin}
                  disabled={isLoading || !userName.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Login</h3>
                  <p className="text-sm text-gray-600 mb-4">Use Internet Identity to access admin dashboard</p>
                </div>
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  disabled={isLoading || !authClient}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Login with Internet Identity'}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
