import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Folder, ExternalLink, Loader2, Home, ChevronRight, Layers } from 'lucide-react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const SIDEBAR_ITEMS = [
  { name: "首頁", path: "", icon: <Home size={20} /> },
  { name: "修課心得", path: "修課心得", icon: <Layers size={20} /> },
  { name: "其他筆記", path: "其他筆記", icon: <Layers size={20} /> },
  { name: "大一 (智慧資安)", path: "大一(智慧資安)", icon: <Layers size={20} /> },
  { name: "大二上", path: "大二上", icon: <Layers size={20} /> },
  { name: "大二下", path: "大二下", icon: <Layers size={20} /> }
];

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/list/${currentPath}`);
        setFiles(res.data);
      } catch (err) {
        console.error("無法抓取筆記:", err);
      }
      setLoading(false);
    };
    fetchNotes();
  }, [currentPath]);

  // Handle navigating into a folder or opening a file
  const handleItemClick = (file) => {
    if (file.type === 'dir') {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      setCurrentPath(newPath);
    } else {
      if (file.ext && file.ext.toLowerCase() === 'pdf') {
        setPreviewFile(file);
      } else {
        window.open(file.download_url, "_blank");
      }
    }
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return (
      <div className="breadcrumbs">
        <button className="breadcrumb-item" onClick={() => setCurrentPath("")}>
          <Home size={16} /> 根目錄
        </button>
        {parts.map((part, index) => {
          const pathToHere = parts.slice(0, index + 1).join('/');
          return (
            <React.Fragment key={pathToHere}>
              <ChevronRight size={16} className="breadcrumb-separator" />
              <button 
                className="breadcrumb-item" 
                onClick={() => setCurrentPath(pathToHere)}
              >
                {part}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>XT's Journey</h2>
          <p>My Course Notes Archive</p>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => {
            // Determine if the current active path falls under this root item
            const isActive = item.path === "" 
              ? currentPath === "" 
              : currentPath.split('/')[0] === item.path;

            return (
              <button
                key={item.path}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentPath(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          {renderBreadcrumbs()}
        </header>

        <section className="content-area">
          {loading ? (
            <div className="loading-wrapper"><Loader2 className="spinner" size={44} /></div>
          ) : (
            <div className="file-grid">
              {files.map((file, index) => (
                <div 
                   key={index} 
                   className="file-card"
                   onClick={() => handleItemClick(file)}
                >
                  <div className="card-icon-wrapper">
                    {file.type === 'dir' ? <Folder className="icon-folder" size={32} /> : <FileText className="icon-file" size={32} />}
                  </div>
                  <div className="card-details">
                    <h3 className="file-name" title={file.name}>{file.name}</h3>
                    <p className="file-type">{file.type === 'dir' ? 'Folder' : (file.ext || 'File')}</p>
                  </div>
                  {file.type === 'file' && (
                     <div className="action-button" title="預覽檔案">
                        <ExternalLink size={18} />
                     </div>
                  )}
                </div>
              ))}
              {files.length === 0 && !loading && (
                <div className="empty-state">
                  <p>這個資料夾目前是空的喔！</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modal for PDF Preview */}
      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 title={previewFile.name}>{previewFile.name}</h3>
              <button className="modal-close" onClick={() => setPreviewFile(null)}>✕</button>
            </div>
            <div className="modal-body">
              <iframe 
                src={`${API_BASE_URL}/api/pdf?url=${encodeURIComponent(previewFile.download_url)}`}
                title={previewFile.name}
                className="pdf-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;