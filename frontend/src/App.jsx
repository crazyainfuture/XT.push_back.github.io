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
  { name: "大二下", path: "大二下", icon: <Layers size={20} /> },
  //{ name: "大三上", path: "大三上", icon: <Layers size={20} /> },
];

function App() {
  const [files, setFiles] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
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
          <Home size={16} /> 
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
          {currentPath === "" && (
            <>
              <div className="recent-updates-section">
                <h2 className="section-title">最新更新</h2>
                <div className="updates-list">
                  <p className="updates-text">2026.06.21  UI 更新</p>
                </div>
              </div>
              
              <div className="courses-section">
                <h2 className="section-title">我的修課紀錄</h2>
                <div className="courses-grid">
                  {[
                    { title: "大一 (智慧資安)", desc: "計算機概論、程式設計(一)(二)(JAVA)、數位邏輯設計、離散數學、微積分(一)(二)、人工智慧概論、智慧資安講座、資訊安全導論" },
                    { title: "大二上", desc: "程式設計(一)(C)、線性代數、組合語言、資料結構、數位系統導論、壘球" },
                    { title: "大二下", desc: "計算機組織、程式設計(二)(C++)、數位系統實作、演算法、工程數學、作業系統、防身術、台灣社會與文化" },
                    { title: "大三上", desc: "" },
                    { title: "大三下", desc: "" },
                    { title: "大四上", desc: "" },
                    { title: "大四下", desc: "" }
                  ].map((course, i) => (
                    <div key={i} className="course-card">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-desc">{course.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
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