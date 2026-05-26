# 树礼书院足球队官网

React + Cloudflare Pages + D1

## 本地开发

```bash
npm install
npm run db:migrate:local   # 首次需要：初始化本地数据库（只建表，数据需自行 INSERT）
npm run dev                # 启动前端 + 后端，访问 http://localhost:5173
```

## 部署

推到 GitHub `main` 分支，Cloudflare Pages 自动构建发布。
