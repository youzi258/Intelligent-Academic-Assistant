import React, { useState } from 'react'
import axios from 'axios'
import { Diff2Html } from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'

function 论文润色() {
  const [文本, set文本] = useState('')
  const [类型, set类型] = useState('表达润色')
  const [语言, set语言] = useState('中文')
  const [结果, set结果] = useState(null)
  const [加载中, set加载中] = useState(false)
  const [错误, set错误] = useState(null)

  const 润色类型选项 = [
    '表达润色',
    '逻辑检查',
    '去AI味',
    '翻译（中译英）',
    '翻译（英译中）',
    '缩写',
    '扩写'
  ]

  const 语言选项 = ['中文', '英文']

  const 处理提交 = async (e) => {
    e.preventDefault()
    if (!文本.trim()) {
      set错误('请输入文本')
      return
    }

    set加载中(true)
    set错误(null)
    set结果(null)

    try {
      const 响应 = await axios.post('/api/润色/', {
        文本: 文本,
        类型: 类型,
        语言: 语言
      })
      set结果(响应.data)
    } catch (err) {
      set错误('润色失败，请稍后重试')
      console.error('润色失败:', err)
    } finally {
      set加载中(false)
    }
  }

  const 渲染差异 = () => {
    if (!结果) return null

    const 差异 = Diff2Html.html(
      {
        oldString: 结果.原始文本,
        newString: 结果.润色文本
      },
      {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        renderNothingWhenEmpty: true
      }
    )
    return (
      <div className="diff-container" dangerouslySetInnerHTML={{ __html: 差异 }} />
    )
  }

  return (
    <div className="section">
      <h2>论文润色</h2>
      <form onSubmit={处理提交}>
        <div className="form-group">
          <label htmlFor="文本">输入文本</label>
          <textarea
            id="文本"
            value={文本}
            onChange={(e) => set文本(e.target.value)}
            placeholder="请输入需要润色的论文文本..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="类型">润色类型</label>
          <select
            id="类型"
            value={类型}
            onChange={(e) => set类型(e.target.value)}
          >
            {润色类型选项.map((选项) => (
              <option key={选项} value={选项}>{选项}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="语言">语言</label>
          <select
            id="语言"
            value={语言}
            onChange={(e) => set语言(e.target.value)}
          >
            {语言选项.map((选项) => (
              <option key={选项} value={选项}>{选项}</option>
            ))}
          </select>
        </div>
        
        <button type="submit" disabled={加载中}>
          {加载中 ? '润色中...' : '开始润色'}
        </button>
      </form>

      {错误 && <div className="result" style={{ borderLeftColor: '#f44336' }}>{错误}</div>}
      
      {结果 && (
        <div className="result">
          <h3>润色结果</h3>
          {渲染差异()}
          {结果.修改日志 && (
            <div style={{ marginTop: '20px' }}>
              <h4>修改日志</h4>
              <p>{结果.修改日志}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default 论文润色
