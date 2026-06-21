from fastapi import FastAPI, HTTPException
from github import Github
from fastapi.middleware.cors import CORSMiddleware
import os
from urllib.parse import urlparse
from dotenv import load_dotenv
import requests
from fastapi.responses import StreamingResponse
load_dotenv()

app = FastAPI()

# 允許前端跨域存取 (CORS)
origins = [
    "http://localhost:5173",       # Vite 本地開發預設 port
    "http://127.0.0.1:5173",
    # 如果之後有部署在 GitHub Pages 或其他地方，請將網域加在這裡，例如：
    "https://crazyainfuture.github.io"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_methods=["GET", "OPTIONS"], # 原本是 "*" ，現在因為您只有讀取資料，我們限縮到只有 GET 和 OPTIONS (CORS 預檢)
    allow_headers=["*"],
)


TOKEN = os.getenv("GITHUB_TOKEN")
REPO = os.getenv("REPO_NAME")
# 從 .env 讀取要排除的資料夾名稱 (以逗號分隔)
EXCLUDE_FOLDERS = [f.strip() for f in os.getenv("EXCLUDE_FOLDERS", "").split(",") if f.strip()]

g = Github(TOKEN)
repo = g.get_repo(REPO)

@app.get("/")
async def root():
    return {"message": "我的筆記 API 運作中！請使用 /api/list/ 存取資料"}

@app.get("/api/pdf")
def proxy_pdf(url: str):
    # 防範 SSRF：檢查是否為 Github 內容的合法網址
    parsed_url = urlparse(url)
    allowed_domains = ["raw.githubusercontent.com", "github.com"]
    if parsed_url.netloc not in allowed_domains:
        raise HTTPException(status_code=403, detail="Forbidden URL")

    def iterfile():
        with requests.get(url, stream=True) as r:
            for chunk in r.iter_content(chunk_size=8192):
                yield chunk
    return StreamingResponse(iterfile(), media_type="application/pdf", headers={"Content-Disposition": "inline"})

@app.get("/api/list/{folder_path:path}")
async def list_files(folder_path: str):
    # 防範 Path Traversal (路徑穿越)
    if ".." in folder_path:
        raise HTTPException(status_code=400, detail="Invalid path")

    print(f"目前正在嘗試抓取路徑: {folder_path}")
    try:
        # 如果路徑為空，代表根目錄
        path = folder_path if folder_path else ""
        contents = repo.get_contents(path)
        
        items = []
        for content in contents:
            # 如果是在根目錄，且該檔案/資料夾名稱在排除名單內，則跳過
            if path == "" and content.name in EXCLUDE_FOLDERS:
                continue
                
            items.append({
                "name": content.name,
                "type": content.type, # 'file' 或 'dir'
                "download_url": content.download_url,
                "ext": content.name.split('.')[-1] if '.' in content.name else ""
            })
        return items
    except Exception as e:
        raise HTTPException(status_code=404, detail="找不到路徑")