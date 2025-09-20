## 📸 Screenshots
![Upload Page](Screenshotfrom2025-09-2016-44-42.png)
![Screenshot 16-45-16](Screenshot%20from%202025-09-20%2016-45-16.png)
![Screenshot 16-45-23](Screenshot%20from%202025-09-20%2016-45-23.png)
![Screenshot 16-46-05](Screenshot%20from%202025-09-20%2016-46-05.png)
![Screenshot 16-46-14](Screenshot%20from%202025-09-20%2016-46-14.png)
![Screenshot 16-46-21](Screenshot%20from%202025-09-20%2016-46-21.png)


# 🎬 Video Clipper
A full-stack web application that takes a long MP4 video upload and automatically cuts it into shorter clips, including vertical **9:16 social-media-ready** versions for TikTok, YouTube Shorts, and Instagram Reels.

Note* I did this entire project with the help of AI. Gemini created the HTML for the looks of the website iteself.
Once you are done you can view it by typing Open your browser at http://localhost:3000 in your browser.
## ✨ Features
- Drag-and-drop or click-to-upload MP4 interface (TailwindCSS frontend)
- Choose number of clips and clip length
- Backend built with **Node.js + Express**
- File upload handling with **Multer**
- Video processing using **ffmpeg**
- Outputs preview + download links for each clip
- Lightweight `.gitignore` to keep storage & node_modules out of the repo

## 🛠️ Tech Stack
- **Frontend:** HTML, TailwindCSS, vanilla JavaScript  
- **Backend:** Node.js, Express, Multer  
- **Video processing:** ffmpeg (via `clipper.js`)  
- **OS tested:** Ubuntu Linux

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)  
- npm (comes with Node.js)  
- ffmpeg (installed separately)  

### Installation
```bash
# clone the repo
git clone https://github.com/YOUR-USERNAME/ai-video-clipper.git
cd ai-video-clipper

# install dependencies
npm install

# run the server
npm run dev
