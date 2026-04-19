# ExamIO Frontend

Frontend của ExamIO được xây dựng bằng React 19, Vite, React Router và Zustand.

## Yêu cầu

- Node.js 20+
- Yarn 4 (qua Corepack)

## Bắt đầu

```bash
corepack enable
cd examio-fe
yarn install
yarn dev
```

Ứng dụng chạy ở `http://localhost:5173`.

## Scripts

```bash
yarn dev
yarn build
yarn preview
yarn start
yarn lint
yarn lint:fix
```

- `yarn dev`: chạy Vite dev server trên port `5173`
- `yarn build`: build production vào thư mục `dist/`
- `yarn preview` / `yarn start`: preview bản build trên port `4173`

## Docker

Dockerfile frontend đã được chỉnh theo Vite runtime. Ảnh build sẽ chạy `yarn preview --host 0.0.0.0 --port 4173`.
