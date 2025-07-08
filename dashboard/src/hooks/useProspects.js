import { useState, useEffect } from 'react';

export const useProspects = () => {
  const [prospects, setProspects] = useState([]);
  const [loadingProspects, setLoadingProspects] = useState(false);

  const fetchProspects = async () => {
    setLoadingProspects(true);
    try {
      const response = await fetch('/api/prospects');
      const data = await response.json();
      setProspects(data);
    } catch (error) {
      setProspects([]); // Only show empty array on error
    } finally {
      setLoadingProspects(false);
    }
  };

  const refreshProspects = () => {
    fetchProspects();
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  return {
    prospects,
    loadingProspects,
    refreshProspects
  };
}; 