// AI Role: ビルド・テスト・サーバー設定の提供
// 役割: Viteのビルド・開発サーバー設定およびVitestのテスト環境設定

// なぜ: viteのdefineConfigではなく、vitest/configのdefineConfigを使うことで'test'プロパティの型エラーを完全に解消できるため
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // なぜ: npm run dev実行時に自動でブラウザを開くようにするため
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});