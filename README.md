# Cesium 地图应用示例

## 项目介绍

本项目是一个基于 Cesium.js 的三维地图应用示例，集成了多种地图交互功能和可视化效果。项目使用 TypeScript 进行开发，采用 Vite 作为构建工具，提供了丰富的地图操作和分析功能。

## 技术栈

-   Cesium.js：三维地图引擎
-   React：前端框架
-   TypeScript：开发语言
-   Vite：构建工具
-   SCSS：样式处理

## 主要功能

### 1. 地图绘制工具 (DrawManager)

-   支持绘制矩形区域
-   支持绘制圆形区域
-   实时预览绘制效果
-   完整的绘制生命周期管理

### 2. 相机控制 (CameraManager)

-   视角控制
-   飞行动画
-   位置定位

### 3. 图层管理 (LayerManager)

-   图层添加/删除
-   图层显示控制
-   图层样式设置

### 4. 空间分析 (AnalysisManager)

-   地形分析
-   可视域分析
-   测量工具

### 5. 天气效果

-   天气系统集成
-   自定义着色器效果
-   动态天气切换

## 安装部署

1. 克隆项目并安装依赖：

```bash
pnpm install
```

2. 开发环境运行：

```bash
pnpm dev
```

3. 生产环境构建：

```bash
pnpm build
```

## 开发配置

### 环境变量配置

项目包含两个环境配置文件：

-   `.env.development`：开发环境配置
-   `.env.production`：生产环境配置

### 地图配置

基础地图配置文件位于：

-   `public/base_config.json`：基础配置
-   `public/basic_config_view.json`：视图配置

## 项目结构

```
├── src/
│   ├── components/     # 组件目录
│   ├── config/         # 配置文件
│   ├── core/          # 核心功能
│   ├── hooks/         # React Hooks
│   ├── layout/        # 布局组件
│   ├── pages/         # 页面组件
│   ├── shaders/       # 着色器
│   ├── store/         # 状态管理
│   ├── tools/         # 工具类
│   ├── types/         # 类型定义
│   └── utils/         # 工具函数
```

## 使用示例

### 初始化地图

```typescript
import { CoreScene } from '@/core/CoreScene';

const scene = new CoreScene(viewerOptions);
```

### 使用绘制工具

```typescript
import { DrawManager } from '@/tools/DrawManager';

const drawManager = new DrawManager(viewer);
drawManager.startDraw(DrawMode.Rectangle); // 开始绘制矩形
```

## 注意事项

1. 确保已正确配置 Cesium 资源文件路径
2. 开发时注意浏览器兼容性
3. 大数据量场景下注意性能优化

## 贡献指南

欢迎提交问题和改进建议，请遵循以下步骤：

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 发起 Pull Request

## 许可证

[MIT License](LICENSE)
