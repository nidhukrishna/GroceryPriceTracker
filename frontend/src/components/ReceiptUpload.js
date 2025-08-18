import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';

const ReceiptUpload = () => {
  const [file, setFile] = useState(null);
  // We get both user and authTokens from the context now
  const { user, authTokens } = useContext(AuthContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- THIS IS THE FIX ---
    // 1. Check if the user is actually logged in before proceeding.
    if (!authTokens) {
      alert('You must be logged in to upload a receipt.');
      return;
    }

    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('receipt_image', file);

    try {
      const response = await axios.post('${API_BASE_URL}/api/receipt/process/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 2. We can now be sure authTokens exists here.
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });

      if (response.status === 201) {
        alert('Receipt uploaded and processed successfully!');
        // You can add logic here to refresh the list of receipts, e.g., window.location.reload();
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Failed to upload receipt.');
    }
  };

  // Conditionally render the form only if the user is logged in.
  // This adds another layer of protection.
  if (!user) {
    return null;
  }

  return (
    <div>
      <h3>Upload a New Receipt</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default ReceiptUpload;