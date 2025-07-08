import { useState, useEffect } from 'react';

export const useEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      setEmails([]); // Only show empty array on error
    } finally {
      setLoadingEmails(false);
    }
  };

  const refreshEmails = () => {
    fetchEmails();
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return {
    emails,
    loadingEmails,
    refreshEmails
  };
}; 