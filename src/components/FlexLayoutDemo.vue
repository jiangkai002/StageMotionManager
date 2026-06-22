<script setup lang="ts">
import { ref } from 'vue'

// ─── 容器属性 ───────────────────────────────────────────

const flexDirection = ref<'row' | 'row-reverse' | 'column' | 'column-reverse'>('row')
const justifyContent = ref<
  'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
>('flex-start')
const alignItems = ref<'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'>('stretch')
const flexWrap = ref<'nowrap' | 'wrap' | 'wrap-reverse'>('nowrap')

// ─── 子元素属性 ─────────────────────────────────────────

const flexGrow = ref(0)
const flexShrink = ref(1)
const flexBasis = ref('auto')
const alignSelf = ref<'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'>('auto')

// ─── 选项列表 ───────────────────────────────────────────

const directionOptions = [
  { label: 'row（水平→）', value: 'row' },
  { label: 'row-reverse（水平←）', value: 'row-reverse' },
  { label: 'column（垂直↓）', value: 'column' },
  { label: 'column-reverse（垂直↑）', value: 'column-reverse' },
]

const justifyOptions = [
  { label: 'flex-start（起始对齐）', value: 'flex-start' },
  { label: 'flex-end（末尾对齐）', value: 'flex-end' },
  { label: 'center（居中）', value: 'center' },
  { label: 'space-between（两端对齐）', value: 'space-between' },
  { label: 'space-around（环绕间距）', value: 'space-around' },
  { label: 'space-evenly（均匀间距）', value: 'space-evenly' },
]

const alignOptions = [
  { label: 'stretch（拉伸填满）', value: 'stretch' },
  { label: 'flex-start（顶部对齐）', value: 'flex-start' },
  { label: 'flex-end（底部对齐）', value: 'flex-end' },
  { label: 'center（垂直居中）', value: 'center' },
  { label: 'baseline（基线对齐）', value: 'baseline' },
]

const wrapOptions = [
  { label: 'nowrap（不换行）', value: 'nowrap' },
  { label: 'wrap（换行）', value: 'wrap' },
  { label: 'wrap-reverse（反向换行）', value: 'wrap-reverse' },
]

const alignSelfOptions = [
  { label: 'auto（跟随父级）', value: 'auto' },
  { label: 'flex-start', value: 'flex-start' },
  { label: 'flex-end', value: 'flex-end' },
  { label: 'center', value: 'center' },
  { label: 'stretch', value: 'stretch' },
  { label: 'baseline', value: 'baseline' },
]

// ─── 容器样式计算 ───────────────────────────────────────

function containerStyle() {
  return {
    display: 'flex',
    flexDirection: flexDirection.value,
    justifyContent: justifyContent.value,
    alignItems: alignItems.value,
    flexWrap: flexWrap.value,
  }
}

// ─── 第一个子元素样式（演示 flex-grow / shrink / basis / align-self） ───

function itemStyle() {
  return {
    flexGrow: flexGrow.value,
    flexShrink: flexShrink.value,
    flexBasis: flexBasis.value,
    alignSelf: alignSelf.value,
  }
}
</script>

<template>
  <div class="flex-demo">
    <h1>Flex 弹性布局详解</h1>
    <p class="intro">
      Flex（弹性盒子）是 CSS 中最强大的布局工具。核心思想：容器（父）控制排列方向和间距，
      子元素控制自身伸缩。下面通过可交互的示例逐一讲解每个属性。
    </p>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>📌 核心概念</h2>
      <div class="concept-diagram">
        <pre>
┌── flex 容器 (display: flex) ──────────────────────────┐
│  main-start                              main-end      │
│  ────►  ┌──────┐  ┌──────┐  ┌──────┐  ◄────           │
│  主轴    │ item │  │ item │  │ item │   交叉轴          │
│  (main)  │  1   │  │  2   │  │  3   │   (cross)        │
│          └──────┘  └──────┘  └──────┘    │             │
│  cross-start                             │ cross-end   │
└─────────────────────────────────────────────────────────┘
        </pre>
      </div>
      <ul>
        <li><b>主轴（main axis）</b>：元素排列的方向线，默认水平向右</li>
        <li><b>交叉轴（cross axis）</b>：与主轴垂直的线，默认垂直向下</li>
        <li><b>flex 容器</b>：设置了 <code>display: flex</code> 的元素</li>
        <li><b>flex 子项</b>：容器内的直接子元素</li>
      </ul>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>1️⃣ flex-direction — 主轴方向</h2>
      <p>决定子元素的排列方向，是水平还是垂直。这是 flex 布局的"地基"。</p>
      <div class="controls">
        <el-radio-group v-model="flexDirection">
          <el-radio-button v-for="opt in directionOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex-container" :style="containerStyle()">
        <div class="flex-item">1</div>
        <div class="flex-item">2</div>
        <div class="flex-item">3</div>
      </div>
      <div class="code-hint">
        <code>flex-direction: {{ flexDirection }};</code>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>2️⃣ justify-content — 主轴对齐</h2>
      <p>控制子元素在<b>主轴方向</b>上的排列方式和间距分布。</p>
      <div class="controls">
        <el-radio-group v-model="justifyContent">
          <el-radio-button v-for="opt in justifyOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex-container" :style="containerStyle()">
        <div class="flex-item">1</div>
        <div class="flex-item">2</div>
        <div class="flex-item">3</div>
      </div>
      <div class="code-hint">
        <code>justify-content: {{ justifyContent }};</code>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>3️⃣ align-items — 交叉轴对齐</h2>
      <p>控制子元素在<b>交叉轴方向</b>（与主轴垂直）上的对齐方式。</p>
      <div class="controls">
        <el-radio-group v-model="alignItems">
          <el-radio-button v-for="opt in alignOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex-container tall" :style="containerStyle()">
        <div class="flex-item">1</div>
        <div class="flex-item tall-item">2</div>
        <div class="flex-item">3</div>
      </div>
      <div class="code-hint">
        <code>align-items: {{ alignItems }};</code>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>4️⃣ flex-wrap — 换行控制</h2>
      <p>当子元素总宽度超过容器时，是否换行。默认 <code>nowrap</code> 会压缩子元素。</p>
      <div class="controls">
        <el-radio-group v-model="flexWrap">
          <el-radio-button v-for="opt in wrapOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex-container" :style="containerStyle()">
        <div class="flex-item" v-for="i in 8" :key="i">{{ i }}</div>
      </div>
      <div class="code-hint">
        <code>flex-wrap: {{ flexWrap }};</code>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>5️⃣ flex-grow / shrink / basis — 子元素伸缩</h2>
      <p>
        这三个属性作用于<b>子元素</b>，控制它在剩余空间中如何放大、缩小、初始大小。
        下面调整 <b>第 1 个元素</b> 的值，观察变化：
      </p>

      <div class="controls-grid">
        <div class="control-item">
          <label>flex-grow（放大比例）</label>
          <el-slider v-model="flexGrow" :min="0" :max="4" :step="1" />
          <span class="value-tag">{{ flexGrow }}</span>
        </div>
        <div class="control-item">
          <label>flex-shrink（缩小比例）</label>
          <el-slider v-model="flexShrink" :min="0" :max="4" :step="1" />
          <span class="value-tag">{{ flexShrink }}</span>
        </div>
        <div class="control-item">
          <label>flex-basis（初始大小）</label>
          <el-select v-model="flexBasis" size="small">
            <el-option label="auto" value="auto" />
            <el-option label="50px" value="50px" />
            <el-option label="100px" value="100px" />
            <el-option label="150px" value="150px" />
            <el-option label="200px" value="200px" />
          </el-select>
        </div>
        <div class="control-item">
          <label>align-self（单独对齐）</label>
          <el-select v-model="alignSelf" size="small">
            <el-option v-for="opt in alignSelfOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>

      <div class="flex-container tall" :style="containerStyle()">
        <div class="flex-item highlighted" :style="itemStyle()">1</div>
        <div class="flex-item">2</div>
        <div class="flex-item">3</div>
      </div>
      <div class="code-hint">
        <code>
          flex-grow: {{ flexGrow }}; flex-shrink: {{ flexShrink }}; flex-basis: {{ flexBasis }};
        </code>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>📋 速查表</h2>
      <table class="cheat-table">
        <thead>
          <tr>
            <th>属性</th>
            <th>作用对象</th>
            <th>说明</th>
            <th>常用值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>display</code></td>
            <td>容器</td>
            <td>开启 flex 布局</td>
            <td><code>flex</code> / <code>inline-flex</code></td>
          </tr>
          <tr>
            <td><code>flex-direction</code></td>
            <td>容器</td>
            <td>主轴方向</td>
            <td><code>row</code> / <code>column</code></td>
          </tr>
          <tr>
            <td><code>justify-content</code></td>
            <td>容器</td>
            <td>主轴对齐 & 间距</td>
            <td><code>center</code> / <code>space-between</code></td>
          </tr>
          <tr>
            <td><code>align-items</code></td>
            <td>容器</td>
            <td>交叉轴对齐</td>
            <td><code>center</code> / <code>stretch</code></td>
          </tr>
          <tr>
            <td><code>flex-wrap</code></td>
            <td>容器</td>
            <td>是否换行</td>
            <td><code>nowrap</code> / <code>wrap</code></td>
          </tr>
          <tr>
            <td><code>align-content</code></td>
            <td>容器</td>
            <td>多行间距（需 wrap）</td>
            <td><code>space-between</code> / <code>center</code></td>
          </tr>
          <tr>
            <td><code>gap</code></td>
            <td>容器</td>
            <td>子元素间距</td>
            <td><code>10px</code> / <code>1rem</code></td>
          </tr>
          <tr>
            <td><code>flex-grow</code></td>
            <td>子元素</td>
            <td>放大比例</td>
            <td><code>0</code>（默认）/ <code>1</code></td>
          </tr>
          <tr>
            <td><code>flex-shrink</code></td>
            <td>子元素</td>
            <td>缩小比例</td>
            <td><code>1</code>（默认）/ <code>0</code></td>
          </tr>
          <tr>
            <td><code>flex-basis</code></td>
            <td>子元素</td>
            <td>初始大小</td>
            <td><code>auto</code> / <code>100px</code></td>
          </tr>
          <tr>
            <td><code>align-self</code></td>
            <td>子元素</td>
            <td>单独交叉轴对齐</td>
            <td><code>center</code> / <code>flex-end</code></td>
          </tr>
          <tr>
            <td><code>order</code></td>
            <td>子元素</td>
            <td>排列顺序</td>
            <td><code>0</code>（默认）/ <code>-1</code></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ════════════════════════════════════════════════════ -->
    <section class="concept-card">
      <h2>💡 常见布局配方</h2>
      <div class="recipe-grid">
        <div class="recipe">
          <h3>水平垂直居中</h3>
          <div class="recipe-demo center-demo">
            <div class="recipe-box">居中</div>
          </div>
          <pre>.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}</pre>
        </div>

        <div class="recipe">
          <h3>两端对齐导航栏</h3>
          <div class="recipe-demo between-demo">
            <div class="recipe-box small">Logo</div>
            <div class="recipe-box small">菜单</div>
          </div>
          <pre>.parent {
  display: flex;
  justify-content: space-between;
  align-items: center;
}</pre>
        </div>

        <div class="recipe">
          <h3>左侧固定 + 右侧自适应</h3>
          <div class="recipe-demo sidebar-demo">
            <div class="recipe-box sidebar">侧边栏</div>
            <div class="recipe-box main">主内容（flex: 1）</div>
          </div>
          <pre>.parent { display: flex; }
.sidebar { width: 80px; }
.main { flex: 1; }</pre>
        </div>

        <div class="recipe">
          <h3>等间距卡片网格</h3>
          <div class="recipe-demo grid-demo">
            <div class="recipe-box card" v-for="i in 4" :key="i">{{ i }}</div>
          </div>
          <pre>.parent {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.flex-demo {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  color: #1f2937;
}

.intro {
  margin-bottom: 24px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  line-height: 1.8;
  font-size: 14px;
}

/* ─── 概念卡片 ─── */
.concept-card {
  margin-bottom: 32px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.concept-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}

.concept-card p {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #4b5563;
}

.concept-diagram {
  margin-bottom: 16px;
  padding: 16px;
  background: #1e293b;
  border-radius: 8px;
  overflow-x: auto;
}

.concept-diagram pre {
  margin: 0;
  color: #93c5fd;
  font-size: 12px;
  line-height: 1.6;
}

.concept-card ul {
  padding-left: 20px;
  font-size: 14px;
  line-height: 2;
  color: #374151;
}

.concept-card code {
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 13px;
  color: #db2777;
}

/* ─── 控制区 ─── */
.controls {
  margin-bottom: 16px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-item label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.control-item .value-tag {
  font-size: 12px;
  color: #6b7280;
}

/* ─── 演示容器 ─── */
.flex-container {
  display: flex;
  min-height: 120px;
  padding: 12px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  gap: 8px;
}

.flex-container.tall {
  min-height: 200px;
}

.flex-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #3b82f6;
  color: #fff;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.flex-item.tall-item {
  height: 100px;
}

.flex-item.highlighted {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.code-hint {
  margin-top: 12px;
  padding: 8px 12px;
  background: #1e293b;
  border-radius: 6px;
}

.code-hint code {
  color: #4ade80;
  font-size: 13px;
}

/* ─── 速查表 ─── */
.cheat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.cheat-table th {
  padding: 10px 12px;
  background: #f1f5f9;
  text-align: left;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 2px solid #cbd5e1;
}

.cheat-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #374151;
}

.cheat-table td code {
  padding: 2px 6px;
  background: #f8fafc;
  border-radius: 4px;
  color: #db2777;
  font-size: 12px;
}

.cheat-table tr:hover td {
  background: #f8fafc;
}

/* ─── 布局配方 ─── */
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.recipe {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.recipe h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #1e293b;
}

.recipe-demo {
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-height: 80px;
}

.recipe-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
}

.recipe-box.small {
  padding: 6px 10px;
  font-size: 12px;
}

.recipe pre {
  margin: 0;
  padding: 10px;
  background: #1e293b;
  border-radius: 6px;
  color: #93c5fd;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

/* 配方演示样式 */
.center-demo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.between-demo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-demo {
  display: flex;
  gap: 8px;
}

.sidebar-demo .sidebar {
  width: 80px;
  flex-shrink: 0;
}

.sidebar-demo .main {
  flex: 1;
}

.grid-demo {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grid-demo .card {
  width: calc(25% - 10px);
  min-width: 40px;
  height: 40px;
  flex: 1 1 calc(25% - 10px);
}
</style>
