import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { listsAPI } from '../../services/api';
import { FILE_UPLOAD } from '../../utils/constants';
import { toast } from 'react-toastify';

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateFile = (selectedFile) => {
    // Check file size
    if (selectedFile.size > FILE_UPLOAD.MAX_SIZE) {
      toast.error(`File size exceeds ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB limit`);
      return false;
    }

    // Check file type
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.map(ext => ext.slice(1)).includes(fileExtension)) {
      toast.error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await listsAPI.upload(formData);

      toast.success('File uploaded and distributed successfully!');
      navigate('/lists');

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="d-flex align-center gap-3 mb-4">
        <Link to="/lists" className="btn btn-outline btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Lists
        </Link>
        <h1 className="text-2xl font-bold">Upload CSV File</h1>
      </div>

      <div className="max-w-2xl">
        {/* Instructions */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              Upload Instructions
            </h3>
          </div>

          <div className="space-y-2">
            <p><strong>Required CSV Columns:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>FirstName</strong> - Contact's first name (required)</li>
              <li><strong>Phone</strong> - Contact's phone number (required)</li>
              <li><strong>Notes</strong> - Additional notes (optional)</li>
            </ul>

            <p className="text-sm text-gray-600 mt-3">
              <strong>Note:</strong> The system will automatically distribute items equally among your active agents. 
              Items will be distributed among up to 5 agents, with any remainder distributed sequentially.
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Select File</h3>
          </div>

          {!file ? (
            <div
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="upload-icon" />
              <div className="upload-text">
                Drop your CSV file here or click to browse
              </div>
              <div className="upload-subtext">
                Supports CSV, XLSX, and XLS files up to {FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="d-flex align-center justify-between">
                <div className="d-flex align-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg d-flex align-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-600">{formatFileSize(file.size)}</div>
                  </div>
                </div>

                <div className="d-flex align-center gap-2">
                  <div className="text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="d-flex gap-3 pt-4 mt-4 border-t">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn btn-primary"
            >
              {uploading ? (
                <>
                  <div className="spinner w-5 h-5" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Distribute
                </>
              )}
            </button>

            <Link to="/lists" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>

        {/* Sample Format */}
        <div className="card mt-4">
          <div className="card-header">
            <h3 className="card-title">Sample CSV Format</h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>FirstName</th>
                  <th>Phone</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John</td>
                  <td>+1234567890</td>
                  <td>VIP customer</td>
                </tr>
                <tr>
                  <td>Jane</td>
                  <td>+1234567891</td>
                  <td>Follow up needed</td>
                </tr>
                <tr>
                  <td>Mike</td>
                  <td>+1234567892</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCSV;