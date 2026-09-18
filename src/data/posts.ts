import coverBmbAgent from '../assets/cover-bmb-agent.jpg'

export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
  category: string
  tags: string[]
  cover?: string
  /** 段落数组。以 "## " 开头的行渲染为小节标题；以 ``` 包围的行渲染为代码块。 */
  content: string[]
}

export const posts: BlogPost[] = [
  {
    slug: 'bmb-agent-minicpm',
    title: 'BMB Agent：由 MiniCPM 驱动的个人助手',
    description:
      '把 MiniCPM5-2B 和 Kimi-2.6 塞进 Hana Agent（OpenHanako），在一台 M4 16GB 的机器上从翻车到可用的完整魔改记录。',
    date: '2026-09-18',
    readingTime: '12 min',
    category: 'Engineering',
    tags: ['MiniCPM', 'MLX', 'Agent', 'OpenHanako', '端侧部署'],
    cover: coverBmbAgent,
    content: [
      '这篇文章记录我把花子（Hana Agent / OpenHanako）改造成 BMB Agent 的全过程：MiniCPM5-2B 负责工具调用、coding 和长文本输出，Kimi-2.6 负责传递图片内容。一个 2B 的端侧模型和一个云端视觉模型住进同一个 Agent 框架，会发生什么样的故事？',
      '硬件环境限定在一台 M4 16GB 的 MacBook 上。为了在有限的统一内存里跑起来，我在源码里集成了 mlx-lm 对 MiniCPM5-2B 做 8bit 推理——一开始我用的是 4bit 量化版本，那个模型的指令遵循和长文本能力实在是灾难级别，果断放弃。即便如此内存预算依然紧张：上下文窗口压到 64K，max_token 限制在 2048。',
      '## 一、你好，花子',
      '把 OpenHanako 的源码 git clone 下来本地部署后，第一次工具调用测试就翻车了，而且是典型的"小模型多任务并发崩溃"。',
      '测试指令很简单：请写一段优美的文字，并使用 write 工具将其保存到工作区中，文件名为 poem.md。预期的链路是模型先生成文本，再触发结构化的 Function Calling，最后在指定路径落一个 poem.md。',
      '实际输出惨不忍睹：模型把 <function> 标签、CDATA 结界和一篇散文《落花》搅成了一锅粥。具体拆开看是三个问题：一是工具调用格式与自然语言生成混淆，直接输出了 <function name="write"> 这样的 XML 标签甚至 <![CDATA[，把代码结构和散文正文强行缝合；二是参数幻觉，指令明确要求保存为 poem.md，模型却把路径幻听成了 save_test.md；三是执行中断，输出格式不符合框架的解析规范，write 工具根本没被触发。',
      '复盘之后我认为这并非模型基础能力不足，而是 2B 级别小模型在"规划与执行"分离上的典型困境。当时的上下文里模型同时扛着三重压力：官方较长系统提示词（AGENT.md）的上下文开销、严格的工具调用 JSON/XML Schema 格式对齐、开放式散文的生成逻辑。对 16GB 端侧环境和 2B 参数量而言，注意力预算和 KV Cache 的分配根本不足以支撑这种多线程并发，于是格式约束和内容生成一冲突，输出就成了"精神分裂"现场。',
      '## 二、给新家做个大扫除',
      '第一轮测试下来发现，OpenHanako 对端侧模型来说功能繁多而且大多用不上。所以我从源码开始，对整个 Agent 做了一次大扫除。',
      '原则很简单：MiniCPM 看不到的能力，就不能出现在提示词和工具表里；用户数据和历史配置不能因为功能裁剪而被清空。因此每一刀都尽量从 Provider、Engine、路由、工具注册、React 状态、Electron IPC、构建入口和依赖闭包一起处理，而不是只删一个按钮。',
      '这轮实际删掉或禁用的部分包括：Computer Use 整条桌面 GUI 控制链路（macOS/Windows provider、Swift helper、聊天浮层和设置入口），旧配置不清空、接口保留兼容读取，修改动作统一返回 410 FEATURE_UNAVAILABLE；Telegram、QQ、钉钉等社交接入删掉，只保留微信和飞书，历史会话的平台标记和旧配置迁移契约仍然保留；频道与多 Agent 协作入口整页不再装配，普通聊天页保持原样；图片/视频生成相关的运行时、聊天卡片、设置入口和后台任务移除，但图片读取、附件上传、预览、封面图库和视觉辅助链路保留；安装包签名 seed、自动更新辅助代码这些端侧用不上的发布负担也一并去掉，项目保持源码运行模式。',
      '同时 Agent 的核心一刀未动：会话持久化与恢复、WebSocket 事件流、Agent 人格文件、手动固定记忆、轻量滚动摘要、Skills、书桌、附件预览、PathGuard、命令沙盒、写入审批、checkpoint 和审计日志都还在。',
      '做完这步，MiniCPM 的工具面从原来的大杂烩收缩到 11 个基础工具：读文件、搜索、列表、编辑、写入、终端、工具清单、暂存交付文件等。Skills 也不再把完整 SKILL.md 塞进系统提示词，而是先只注入名称、描述和位置，模型判断需要时再调用 read 按需读取。对一个 2B 模型来说，这比"功能齐全"重要得多。',
      '## 三、守规矩和断舍离',
      'OpenHanako / Pi SDK 的工具调用偏向 OpenAI 兼容的 tool_calls，而 MiniCPM5 的原生工具协议是 <function> XML。第一次失败时那种 XML、CDATA 和正文混在一起的样子，正是两边协议没有划清边界的症状。',
      '解法是加一层 MiniCPM XML tool adapter，一共五步：流式输出时先识别 <function> 边界，普通文本增量显示、XML 段落不提前泄漏给用户；解析 <param> 和 CDATA，容忍分片到达的标签；校验函数名、参数 JSON Schema、重复调用和未闭合结构；转换成标准 tool_calls 交给 HanaAgent 原有工具系统；最后把工具结果回填给 MiniCPM，继续下一轮 Agent loop。',
      '如果 XML 不完整、工具不存在或参数非法，adapter 直接返回结构化错误，不执行任何副作用。工具执行仍然走原有的 ResourceIO、PathGuard、OS sandbox、审批和 checkpoint 机制，安全边界没有因为协议适配而被绕开。',
      '系统提示词也被重写成 MiniCPM 专用的 5 条硬规则，只保留"如何选择工具、如何写文件、何时停止"这些必要规则；Kimi 等云端模型继续使用原来的完整提示词。VisionBridge 的职责同样拆开：Kimi 只负责 OCR、题干、公式、标签和图形关系的转录，MiniCPM 负责最终推理和回答，MiniCPM 的请求里不会塞图片 Base64。',
      '上下文策略同样保守：32K 是唯一交互上限，日常建议 12K-16K，输入超过约 12K 时优先触发会话压缩。采样上，工具调用和文件操作使用 0.1-0.2 的低温，只有创意写作才提高 temperature——让"守规矩"和"写东西"不再抢同一份注意力预算。',
      '## 四、把家改成自己喜欢的模样',
      '大扫除之后就可以安心装修了。',
      '第一处是模型参数链路。设置页保存 context、maxOutput 和采样参数后，经过 Provider Registry 和 model-sync，最终进入 MLX 请求的 max_tokens、temperature、top_p、top_k、min_p 和 repetition_penalty。我的日常默认值如下：',
      '```',
      'context = 16384',
      'maxOutput = 1024',
      'temperature = 0.2',
      'topP = 0.9',
      'topK = 40',
      'minP = 0.05',
      'repetitionPenalty = 1.05',
      '```',
      '第二处是 MLX-LM 服务本身。为了避免 16GB 统一内存被多份 KV cache 吃空，服务默认单请求、单 decode、单 prompt cache，prompt cache 里的预算限制在 3GB，预填充步长设为 1024。多轮长文会更倾向复用当前前缀，而不是让多个后台任务同时抢内存。',
      '第三处是给写作流加了一套会话级 /novel 指令：continue 续写、detailed 扩写、review 审稿、recall 恢复人物线与伏笔。这些命令由输入扩展层拦截，不依赖 2B 模型理解指令本身；策略存在 session metadata 里，关闭再恢复会话仍然生效。它裁剪的只是发给模型的历史副本，原始 JSONL 和摘要不会丢。',
      '最后是人格与 Skills。Agent 仍然是"一个文件夹"：人格、头像、记忆和技能可以一起备份；Hanako、Butter、Ming 这些模板没有被裁掉，只是端侧默认少装、少注入。家还是原来的味道，只是房间少了很多用不上的家具。',
      '## 五、文学素养和数理能力',
      '文本串烧：我分别让 MiniCPM5-2B 描写了四季的风景，并持续测试上下文是否混乱或丢失。它非常顺滑地完成了各种要求，最后把四季变换串联成了一篇完整的文字，没有出现前后打架或遗忘早前设定的现象。',
      '小说续写：我节选了一段自己写的小说开头，没有设定后续故事线和感情基调。续写出来的段落在意境和节奏上与原开头衔接得相当自然，没有跑成另一种文风。',
      '读后续写：给它一道英语读后续写题，虽然回答里混进了一些中文表述，但它准确抓住了原文的要点、主题纲要和思想精华，续写方向没有偏。',
      '数学推理和 coding 是最惊喜的部分。一道 2026 年考研数学一的大题，解答完全正确；coding 测试给出的代码也没有问题。对一个本地部署的 2B 模型来说，这个水平远超我的预期。',
      '## 六、工具小能手',
      'Tool use 方面我没有做很深度的体验，这里用三个阶段概括它从不可用到可用的过程：最初是完全失败，XML 和正文混流、write 工具不触发；adapter 上线后出现过重复调用同一工具的情况，靠重复调用校验拦住；最后是指令遵循成功——模型先输出正文，再安静地发起一次结构化调用，poem.md 准确落在工作区。',
      '## 写在最后',
      '这不是一篇严谨的技术 Blog，更像一篇魔改后的体验分享。为了给 MiniCPM 做定制踩了很多坑，碍于时间、电脑配置、技术水平和学业压力（还有 token 缺乏），只能测试到这种程度，项目里还有很多 Bug 要修。如果你对这个项目感兴趣，不妨 fork 一下，在个人电脑上继续 Coding 下去，也可以提 Issues 一起完善。',
      '最后衷心感谢开源项目 OpenHanako（原主奉上）：https://github.com/liliMozi/openhanako',
      'Author：Aluka · https://github.com/Peppermeow29',
    ],
  },
]

export const featuredPost: BlogPost | undefined = posts[0]
