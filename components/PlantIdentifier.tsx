
import React, { useState, useRef } from 'react';
import { analyzePlantImage } from '../services/geminiService';
import { PlantInfo } from '../types';
import { Spinner } from './common/Spinner';
import { Icon } from './common/Icon';

interface HistoryItem {
  plantInfo: PlantInfo;
  image: string;
}

interface PlantIdentifierProps {
  onPlantIdentified: (plant: PlantInfo) => void;
}

const PlantIdentifier: React.FC<PlantIdentifierProps> = ({ onPlantIdentified }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResult(null);
      setError(null);
      
      let fileReaderResult: string = '';
      const reader = new FileReader();
      reader.onloadend = () => {
        fileReaderResult = reader.result as string;
        setImagePreview(fileReaderResult);
      };
      reader.readAsDataURL(file);

      setIsLoading(true);
      const analysisResult = await analyzePlantImage(file);
      setIsLoading(false);
      
      if (analysisResult.error) {
        setError(analysisResult.error);
        setResult(null);
      } else {
        setResult(analysisResult);
        // Ensure fileReaderResult is set before updating history
        const updateHistory = () => {
          if (fileReaderResult) {
            setHistory(prev => [{ plantInfo: analysisResult, image: fileReaderResult }, ...prev]);
          } else {
            setTimeout(updateHistory, 100); // Check again shortly
          }
        };
        updateHistory();
      }
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setImagePreview(item.image);
    setResult(item.plantInfo);
    setError(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
          disabled={isLoading}
        />

        {!imagePreview && !isLoading && (
            <div className="w-full max-w-lg text-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 bg-gray-50 transition-colors">
                <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Identify a Plant</h3>
                <p className="mt-1 text-sm text-gray-500">Upload a photo and our AI will identify it and provide care instructions.</p>
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleUploadClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Upload a Photo
                    </button>
                </div>
            </div>
        )}

        {imagePreview && (
          <div className="w-full mt-4 flex flex-col items-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
                <img src={imagePreview} alt="Plant preview" className="w-full h-auto object-cover max-h-96" />
            </div>
             <button
                type="button"
                onClick={handleUploadClick}
                disabled={isLoading}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
                {isLoading ? "Analyzing..." : "Upload another photo"}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center text-center">
            <Spinner size="w-12 h-12" />
            <p className="mt-4 text-lg font-medium text-gray-600">Analyzing your plant...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        )}

        {error && (
            <div className="mt-8 w-full max-w-lg bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Analysis Failed</p>
                <p>{error}</p>
            </div>
        )}

        {result && !error && (
          <div className="mt-8 w-full max-w-2xl bg-green-50 p-6 rounded-lg shadow-inner space-y-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{result.plantName}</h2>
                <p className="text-gray-600 italic">{result.description}</p>
            </div>
            
            {result.history && (
                <div className="border-t border-green-200 pt-4">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">A Bit of History</h3>
                    <p className="text-gray-700">{result.history}</p>
                </div>
            )}

            <div className="border-t border-green-200 pt-4">
                 <h3 className="text-lg font-semibold mb-2 text-green-800">Care Steps</h3>
                 <ul className="space-y-3 text-gray-700">
                    {result.careSteps.map((step, index) => {
                      const parts = step.split(/:(.*)/s);
                      if (parts.length < 2) return <li key={index}>{step}</li>;
                      
                      const category = parts[0];
                      const instruction = parts[1].trim();
                      
                      return (
                        <li key={index} className="flex items-start">
                          <Icon path="M5 13l4 4L19 7" className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                          <div>
                            <span className="font-semibold text-gray-800">{category}:</span> {instruction}
                          </div>
                        </li>
                      );
                    })}
                 </ul>
            </div>
            <div className="border-t border-green-200 pt-4 text-center">
                <button
                    onClick={() => onPlantIdentified(result)}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-105"
                >
                    <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" className="w-5 h-5" />
                    Ask Verde for More Tips!
                </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12 w-full max-w-4xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Identification History</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item, index) => (
                <div key={index} onClick={() => handleHistoryClick(item)} className="cursor-pointer group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                     <img src={item.image} alt={item.plantInfo.plantName} className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity" />
                  </div>
                  <p className="mt-2 block text-sm font-medium text-gray-900 truncate">{item.plantInfo.plantName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlantIdentifier;
