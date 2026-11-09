import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';

const ReceiptUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const { user, authTokens } = useContext(AuthContext);

  if (!user) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({ type: 'error', text: 'Please select a receipt image first.' });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('receipt_image', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/receipt/process/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      });

      if (response.status === 201) {
        setStatusMsg({ type: 'success', text: 'Receipt scanned & categorized!' });
        setFile(null);
        e.target.reset();
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      const errText =
        error.response?.data?.error || 'Could not extract items. Try a clearer photo.';
      setStatusMsg({ type: 'error', text: errText });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Scan New Receipt</h3>
          <p className="card-subtitle">Upload a photo to extract prices & categories with AI</p>
        </div>
      </div>

      {statusMsg && (
        <div className={statusMsg.type === 'error' ? 'alert-error' : 'alert-success'}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="upload-box">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              disabled={uploading}
            />
            <div>📷 <strong>Click to choose a receipt photo</strong></div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Supports JPG, PNG, WEBP
            </div>
            {file && <div className="upload-filename">Selected: {file.name}</div>}
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={uploading || !file}
        >
          {uploading ? 'Scanning & Categorizing with AI...' : 'Upload & Process Receipt'}
        </button>
      </form>
    </div>
  );
};

export default ReceiptUpload;