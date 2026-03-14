import React, { useState } from 'react'
import axios from 'axios'

function 术语解释() {
  const [术语, set术语] = useState('')
  const [领域, set领域] = useState('计算机科学')
  const [结果, set结果] = useState(null)
  const [加载中, set加载中] = useState(false)
  const [错误, set错误] = useState(null)

  const 领域选项 = [
    '计算机科学',
    '物理学',
    '化学',
    '生物学',
    '医学',
    '经济学',
    '心理学',
    '其他'
  ]

  const 处理提交 = async (e) => {
    e.preventDefault()
    if (!术语.trim()) {
      set错误('请输入术语')
      return
    }

    set加载中(true)
    set错误(null)
    set结果(null)

    try {
      const 响应 = await axios.post('/api/术语解释/', {
        术语: 术语,
        领域: 领域
      })
      set结果(响应.data)
    } catch (err) {
      set错误('解释失败，请稍后重试')
      console.error('解释失败:', err)
    } finally {
      set加载中(false)
    }
  }

  return (
    <div className="section">
      <h2>术语解释</h2>
      <form onSubmit={处理提交}>
        <div className="form-group">
          <label htmlFor="术语">输入术语</label>
          <input
            type="text"
            id="术语"
            value={术语}
            onChange={(e) => set术语(e.target.value)}
            placeholder="请输入需要解释的学术术语..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="领域">领域</label>
          <select
            id="领域"
            value={领域}
            onChange={(e) => set领域(e.target.value)}
          >
            {领域选项.map((选项) => (
              <option key={选项} value={选项}>{选项}</option>
            ))}
          </select>
        </div>
        
        <button type="submit" disabled={加载中}>
          {加载中 ? '解释中...' : '开始解释'}
        </button>
      </form>

      {错误 && <div className="result" style={{ borderLeftColor: '#f44336' }}>{错误}</div>}
      
      {结果 && (
        <div className="result">
          <h3>解释结果</h3>
          <p><strong>术语:</strong> {结果.术语}</p>
          {结果.定义 && (
            <div>
              <strong>定义:</strong>
              <p>{结果.定义}</p>
            </div>
          )}
          {结果.背景知识 && (
            <div>
              <strong>背景知识:</strong>
              <p>{结果.背景知识}</p>
            </div>
          )}
          {结果.相关研究 && (
            <div>
              <strong>相关研究:</strong>
              <p>{结果.相关研究}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default 术语解释
