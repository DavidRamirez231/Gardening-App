
import React, { useState } from 'react';
import PlantIdentifier from './components/PlantIdentifier';
import Chatbot from './components/Chatbot';
import { Icon } from './components/common/Icon';
import { PlantInfo } from './types';

type Tab = 'identifier' | 'chat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('identifier');
  const [identifiedPlant, setIdentifiedPlant] = useState<PlantInfo | null>(null);

  const handlePlantIdentified = (plant: PlantInfo) => {
    setIdentifiedPlant(plant);
    setActiveTab('chat');
  };

  const handleChatGreetingSent = () => {
    setIdentifiedPlant(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identifier':
        return <PlantIdentifier onPlantIdentified={handlePlantIdentified} />;
      case 'chat':
        return <Chatbot identifiedPlant={identifiedPlant} onGreetingSent={handleChatGreetingSent} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; iconPath: string }> = ({ tabName, label, iconPath }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm md:text-base font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-t-lg ${
        activeTab === tabName
          ? 'bg-white text-green-700 border-b-2 border-green-600'
          : 'text-gray-500 hover:bg-green-100 hover:text-green-600'
      }`}
    >
      <Icon path={iconPath} className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 font-sans flex flex-col">
      <header className="bg-white shadow-md w-full sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 4.293a1 1 0 011.414 1.414l-9 9a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l8.293-8.293z" />
                        <path d="M11 2a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4 10a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zM16 10a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" />
                        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5-8a5 5 0 1110 0 5 5 0 01-10 0z" />
                     </svg>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gardening Assistant</h1>
                </div>
            </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center w-full px-4 py-6 md:py-8">
        <div className="w-full max-w-4xl flex-grow flex flex-col">
          <div className="w-full">
            <div className="flex border-b border-gray-200">
              <TabButton tabName="identifier" label="Plant Identifier" iconPath="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              <TabButton tabName="chat" label="Gardening Chat" iconPath="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </div>
          </div>
          <div className="flex-grow bg-white shadow-lg rounded-b-lg">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
