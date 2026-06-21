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

// 可以把修課心得的資料統一放在這裡，方便之後大量新增與管理
const REVIEWS_DATA = [
  { id: 1, subject: "計算機概論", teacher: "李俊達", sweet: "⭐⭐⭐⭐⭐", chill: "⭐⭐⭐⭐", notes: "老師會說要考甚麼東西" },
  { id: 2, subject: "程式設計(一)(二)(JAVA)", teacher: "謝佳燁", sweet: "⭐⭐⭐", chill: "⭐⭐⭐", notes: "老師教得很好，能學到很扎實的基礎" },
  { id: 3, subject: "微積分(一)(二)", teacher: "林宏彥", sweet: "⭐⭐⭐⭐⭐", chill: "⭐⭐", notes: "考試不難，建議多練課本習題" },
  {id: 4, subject: "離散數學", teacher: "徐嘉連", sweet: "⭐⭐⭐⭐⭐", chill: "⭐⭐", notes: "考試有點難度，建議多看課本多練課本習題"},
  {id: 5, subject: "人工智慧概論", teacher: "謝佳燁", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐⭐⭐", notes: "會點名、分組期末報告"},
  {id: 6, subject: "智慧資安講座", teacher: "許見章", sweet: "⭐⭐⭐", chill: "⭐⭐⭐", notes: "每周會寫心得、要去資安大會"},
  {id: 7, subject: "資訊安全導論", teacher: "梅興", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐", notes: "每周都有kahoot，找會讀書的朋友就是涼到爆的課"},
  {id: 8, subject: "大學入門", teacher: "李俊達", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐⭐", notes: "每周點名、課本要看熟"},
  //大二上
  {id: 9, subject: "程式設計(一)(C)", teacher: "葉佐任", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐⭐", notes: "每周點名、課本要看熟"},
  {id: 10, subject: "線性代數", teacher: "費南多", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐⭐", notes: "上課認真聽講"},
  {id: 11, subject: "組合語言", teacher: "費南多", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐⭐", notes: "上課認真聽講"},
  {id: 12, subject: "資料結構", teacher: "張信宏", sweet: "⭐⭐", chill: "⭐", notes: "上課認真聽講、程式要練"},
  {id: 13, subject: "數位系統導論", teacher: "黎氏芳", sweet: "⭐⭐⭐⭐", chill: "⭐⭐⭐", notes: ""},
  {id: 14, subject: "壘球", teacher: "陳建霖", sweet: "⭐⭐⭐⭐⭐", chill: "⭐⭐⭐⭐⭐", notes: "每周點名" },
  //大二下
  {id: 15, subject: "計算機組織", teacher: "郭文彥", sweet: "", chill: "⭐⭐⭐⭐", notes: "每周都有作業"},
  {id: 16, subject: "程式設計(二)(C++)", teacher: "葉佐任", sweet: "", chill: "⭐⭐⭐⭐", notes: "期末報告、每周點名"},
  {id: 17, subject: "數位系統實作", teacher: "盧淑萍", sweet: "", chill: "⭐⭐⭐⭐", notes: "每周上課須完成實作作業，會點名"},
  {id: 18, subject: "演算法", teacher: "王國華", sweet: "", chill: "⭐⭐⭐⭐", notes: "考前一周會重點整理"},
  {id: 19, subject: "工程數學", teacher: "黎氏芳", sweet: "", chill: "⭐⭐⭐", notes: ""},
  {id: 20, subject: "作業系統", teacher: "葉佐任", sweet: "", chill: "⭐⭐⭐⭐", notes: "每周點名、課本要看熟"},
  {id: 21, subject: "防身術", teacher: "羅新明", sweet: "⭐⭐⭐⭐⭐", chill: "⭐⭐⭐", notes: "需要熟悉課堂講解的動作，期末考有規定的動作、期末書面心得"},
  {id: 22, subject: "台灣社會與文化", teacher: "柯景棋", sweet: "", chill: "⭐⭐⭐⭐⭐", notes: "每周討論不同關於台灣社會議題、期中期末書面報告"},
  // 如果要新增，只要在下面繼續加類似的格式照抄即可：
  // { id: 4, subject: "課程名稱", teacher: "老師", sweet: "⭐⭐⭐", chill: "⭐⭐⭐", notes: "備註內容" }
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
                  <p className="updates-text">2026.06.21 --- UI 更新</p>
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

          {currentPath === "修課心得" && (
            <div className="reviews-section">
              <h2 className="section-title">修課心得總覽</h2>
              <div className="reviews-table-container">
                <div className="reviews-table-header">
                  <div className="r-col r-col-subject">科目</div>
                  <div className="r-col r-col-teacher">授課老師</div>
                  <div className="r-col r-col-sweet">甜度</div>
                  <div className="r-col r-col-chill">涼度</div>
                  <div className="r-col r-col-notes">備註</div>
                </div>
                <div className="reviews-table-body">
                  {REVIEWS_DATA.map((review) => (
                    <div className="reviews-table-row" key={review.id}>
                       <div className="r-col r-col-subject">{review.subject}</div>
                       <div className="r-col r-col-teacher">{review.teacher}</div>
                       <div className="r-col r-col-sweet">{review.sweet}</div>
                       <div className="r-col r-col-chill">{review.chill}</div>
                       <div className="r-col r-col-notes">{review.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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