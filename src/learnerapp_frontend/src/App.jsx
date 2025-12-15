import React, { useState, useEffect } from 'react';
import NotebookLMAPI from './utils/notebookApi';
import { learnerapp_backend, createActor } from 'declarations/learnerapp_backend';
import AuthGate from './components/AuthGate';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

function App() {
  const [api, setApi] = useState(null);
  const [actor, setActor] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin' or 'user'
  const [apiStatus, setApiStatus] = useState('unknown');

  useEffect(() => {
    // Initialize APIs
    const apiInstance = new NotebookLMAPI();
    
    setApi(apiInstance);
    setActor(learnerapp_backend);
    
    checkApiStatus(apiInstance, learnerapp_backend);
  }, []);

  const checkApiStatus = async (apiInstance, actorInstance) => {
    try {
      if (apiInstance) {
        await apiInstance.healthCheck();
      }
      if (actorInstance) {
        await actorInstance.health();
      }
      setApiStatus('healthy');
    } catch (error) {
      console.error('API Status Check Error:', error);
      setApiStatus('error');
    }
  };

  const handleLogin = (userData, type, identity = null) => {
    setUser(userData);
    setUserType(type);
    
    // Update actor with identity for admin operations
    if (identity && type === 'admin') {
      const newActor = createActor(process.env.CANISTER_ID_LEARNERAPP_BACKEND || 'rdmx6-jaaaa-aaaaa-aaadq-cai', {
        agentOptions: { identity }
      });
      setActor(newActor);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setActor(learnerapp_backend); // Reset to default actor
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              📚 NotebookLM Learner
            </h1>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
              <span className={`w-3 h-3 rounded-full ${
                apiStatus === 'healthy' ? 'bg-green-500' : 
                apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
              API Status: {apiStatus}
            </div>
          </div>
        </header>
        <main className="flex-1">
          <AuthGate api={api} onLogin={handleLogin} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            📚 NotebookLM Learner
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 px-4 py-2 rounded-lg font-medium text-gray-900">
              {userType === 'admin' ? '👑 Admin' : `👤 ${user.name || user.principal}`}
            </div>
            <button 
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        {userType === 'admin' ? (
          <AdminDashboard api={api} actor={actor} user={user} />
        ) : (
          <UserDashboard api={api} actor={actor} user={user} />
        )}
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm">
            Powered by NotebookLM API • Internet Computer
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
