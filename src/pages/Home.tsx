import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Virtual Assistant</h1>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome to Virtual Assistant
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/operator')}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Operator Mode
            </button>

            <button
              onClick={() => navigate('/client')}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Client Mode
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}