"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type Community = {
  location_id: number;
  name: string;
  images: {
    media_id: number;
    media_url: string;
    is_primary: boolean;
  }[];
};

const CommunityImageSelector = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch communities and their images
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch("/api/communities-with-media");
      const data = await response.json();
      setCommunities(data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryImage = async (mediaId) => {
    const community = communities[currentIndex];

    try {
      setUpdating(true);

      // Replace with your actual API endpoint
      const response = await fetch("/api/set-primary-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: community.location_id,
          media_id: mediaId,
        }),
      });

      if (response.ok) {
        // Update local state
        const updatedCommunities = [...communities];
        updatedCommunities[currentIndex].images = updatedCommunities[
          currentIndex
        ].images.map((img) => ({
          ...img,
          is_primary: img.media_id === mediaId,
        }));
        setCommunities(updatedCommunities);
      }
    } catch (error) {
      console.error("Error setting primary image:", error);
      // For demo purposes, update locally anyway
      const updatedCommunities = [...communities];
      updatedCommunities[currentIndex].images = updatedCommunities[
        currentIndex
      ].images.map((img) => ({
        ...img,
        is_primary: img.media_id === mediaId,
      }));
      setCommunities(updatedCommunities);
    } finally {
      setUpdating(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : communities.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < communities.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading communities...</div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">No communities found</div>
      </div>
    );
  }

  const currentCommunity = communities[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {currentCommunity.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Community {currentIndex + 1} of {communities.length} •{" "}
                {currentCommunity.images.length} images
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={goToPrevious}
                className="p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCommunity.images.map((image) => (
            <div
              key={image.media_id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                image.is_primary ? "ring-4 ring-green-500" : ""
              } ${updating ? "opacity-70 pointer-events-none" : ""}`}
              onClick={() => !updating && setPrimaryImage(image.media_id)}
            >
              <div className="aspect-video relative">
                <img
                  src={image.media_url}
                  alt={`${currentCommunity.name} - Image ${image.media_id}`}
                  className="w-full h-full object-cover"
                />
                {image.is_primary && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <Check size={20} />
                  </div>
                )}
                {updating && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-white">Updating...</div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  {image.is_primary ? (
                    <span className="text-green-600 font-semibold">
                      Primary Image
                    </span>
                  ) : (
                    <span>Click to set as primary</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Instructions:</strong> Click on any image to set it as the
            primary image for this community. Only one image can be primary at a
            time. Use the arrow buttons to navigate between communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityImageSelector;
