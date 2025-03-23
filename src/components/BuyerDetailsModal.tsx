import React from 'react';
import { FiX, FiPhone, FiMail, FiMapPin, FiDollarSign, FiInfo, FiStar, FiClock, FiCheck, FiTrendingUp, FiCalendar, FiTruck } from 'react-icons/fi';

interface Buyer {
  _id: string;
  name: string;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  interestedCrops: string[];
  offerPrice?: {
    [crop: string]: number;
  };
  distance?: number;
  additionalInfo?: string;
}

interface BuyerDetailsModalProps {
  buyer: Buyer;
  onClose: () => void;
}

const BuyerDetailsModal: React.FC<BuyerDetailsModalProps> = ({ buyer, onClose }) => {
  // Handle click outside to close
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const hasHighPrice = buyer.offerPrice && Object.values(buyer.offerPrice).some(price => price > 30);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-t-xl">
          <div className="absolute top-4 right-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="flex items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{buyer.name}</h2>
              <p className="flex items-center mt-2 text-emerald-100">
                <FiMapPin className="mr-2" /> {buyer.location}
              </p>
              {buyer.distance && (
                <div className="inline-flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm mt-3">
                  <FiMapPin className="mr-1" /> {buyer.distance} km away
                </div>
              )}
            </div>
            
            {hasHighPrice && (
              <div className="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md flex items-center">
                <FiTrendingUp className="mr-1" /> Premium Buyer
              </div>
            )}
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
                <FiPhone className="text-emerald-600 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                    <FiPhone className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <a href={`tel:${buyer.contactInfo.phone}`} className="text-blue-600 hover:underline font-medium">
                      {buyer.contactInfo.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                    <FiMail className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href={`mailto:${buyer.contactInfo.email}`} className="text-blue-600 hover:underline font-medium break-all">
                      {buyer.contactInfo.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                    <FiMapPin className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{buyer.location}</div>
                    <div className="text-sm text-gray-500 mt-1">{buyer.distance} km from you</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <FiStar className="text-blue-600 mr-2" />
                Buyer Preferences
              </h3>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Crops of Interest:</div>
                <div className="flex flex-wrap gap-2">
                  {buyer.interestedCrops.map((crop) => (
                    <span key={crop} className="px-3 py-1 bg-white text-blue-800 rounded-full text-sm border border-blue-200 flex items-center">
                      <FiCheck className="mr-1 text-blue-500" size={14} />
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-2">Buying Preferences:</div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FiCalendar className="mr-2 text-blue-500" />
                    <span>Looking for regular suppliers</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiTruck className="mr-2 text-blue-500" />
                    <span>Can arrange transportation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {buyer.offerPrice && Object.keys(buyer.offerPrice).length > 0 && (
            <div className="mb-6 bg-amber-50 p-5 rounded-xl border border-amber-100 shadow-sm">
              <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                <FiDollarSign className="text-amber-600 mr-2" />
                Price Offers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(buyer.offerPrice).map(([crop, price]) => (
                  <div key={crop} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition-all">
                    <div className="text-sm text-amber-900 mb-1">{crop}</div>
                    <div className="text-lg font-semibold text-amber-700 flex items-center">
                      <FiDollarSign className="mr-1 text-amber-500" /> ₹{price}
                      <span className="text-xs ml-1 text-amber-600">/kg</span>
                    </div>
                    {price > 25 && (
                      <div className="mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded inline-flex items-center">
                        <FiTrendingUp className="mr-1" size={10} /> Premium price
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {buyer.additionalInfo && (
            <div className="mb-6 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiInfo className="text-gray-500 mr-2" />
                Additional Information
              </h3>
              <div className="text-gray-700 bg-white p-4 rounded-lg border border-gray-100">
                <p>{buyer.additionalInfo}</p>
              </div>
            </div>
          )}
          
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
              <FiClock className="text-indigo-600 mr-2" />
              Negotiation Tips
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-indigo-800">
              <li>Mention your crop quality and certifications if any</li>
              <li>Ask about quantity requirements and delivery expectations</li>
              <li>Discuss payment terms before finalizing any deal</li>
              <li>Consider showing photos of your produce for better price negotiation</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <a 
              href={`tel:${buyer.contactInfo.phone}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto"
            >
              <FiPhone className="mr-2" /> Call Now
            </a>
            <a 
              href={`mailto:${buyer.contactInfo.email}?subject=Crop%20Inquiry%20from%20AI%20Farm&body=Hello%20${buyer.name},%0A%0AI'm%20interested%20in%20selling%20my%20crops%20to%20you.%20Let's%20discuss%20further.%0A%0ARegards,%0A[Your%20Name]`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center w-full sm:w-auto"
            >
              <FiMail className="mr-2" /> Email Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDetailsModal; 