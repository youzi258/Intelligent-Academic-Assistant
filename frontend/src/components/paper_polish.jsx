import React, { useState } from 'react'
import axios from 'axios'

function PaperPolish({ apiKey, baseUrl, model }) {
  const [text, setText] = useState('')
  const [polishType, setPolishType] = useState('Expression Polishing')
  const [language, setLanguage] = useState('Chinese')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePolish = async () => {
    if (!text.trim()) {
      setError('请输入要润色的文本')
      return
    }
    
    if (!apiKey) {
      setError('请先在API设置中配置API密钥')
      return
    }
    
    setError('')
    setResult(null) // 清除之前的润色结果
    setLoading(true)
    try {
      const response = await axios.post('/api/polish', {
        text,
        type: polishType,
        language,
        api_key: apiKey,
        base_url: baseUrl,
        model
      })
      setResult(response.data)
    } catch (error) {
      console.error('Polishing failed:', error)
      setError('润色失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const renderDiff = () => {
    if (!result) return null
    
    // 处理expression polishing的输出格式
    let processedPolishedText = result.polished_text
    let useHtml = false
    if (polishType === "Expression Polishing") {
      // 为各个part添加HTML换行标签，确保中文输出时各个part之间有足够的换行
      processedPolishedText = processedPolishedText
        // 处理英文格式的part标签
        .replace(/Part 1 \[LaTeX\]/g, '<br><br>Part 1 [LaTeX]<br>')
        .replace(/Part 2 \[Translation\]/g, '<br><br>Part 2 [Translation]<br>')
        .replace(/Part 3 \[Modification Log\]/g, '<br><br>Part 3 [Modification Log]<br>')
        // 处理实际输出的格式
        .replace(/Part 1 \[Refined Text\]/g, '<br><br>Part 1 [Refined Text]<br>')
        .replace(/Part 2 \[Review Comments\]/g, '<br><br>Part 2 [Review Comments]<br>')
        // 处理中文格式的part标签
        .replace(/第一部分 \[LaTeX\]/g, '<br><br>第一部分 [LaTeX]<br>')
        .replace(/第二部分 \[翻译\]/g, '<br><br>第二部分 [翻译]<br>')
        .replace(/第三部分 \[修改日志\]/g, '<br><br>第三部分 [修改日志]<br>')
        .replace(/第一部分 \[修改文本\]/g, '<br><br>第一部分 [修改文本]<br>')
        .replace(/第二部分 \[修改评论\]/g, '<br><br>第二部分 [修改评论]<br>')
      useHtml = true
    }
    
    // 对于logic check，只有当polished text与original text不同时才显示
    if (polishType === "Logic Check" && result.polished_text === result.original_text) {
      return (
        <div className="side-by-side-diff">
          <div className="diff-column">
            <h4>原文</h4>
            <div className="diff-content original">
              {result.original_text}
            </div>
          </div>
        </div>
      )
    }
    
    // 对于remove ai flavor，去掉上面的polished text
    if (polishType === "Remove AI Flavor") {
      return (
        <div className="side-by-side-diff">
          <div className="diff-column">
            <h4>原文</h4>
            <div className="diff-content original">
              {result.original_text}
            </div>
          </div>
        </div>
      )
    }
    
    // 对于缩写和扩写功能，去掉上面的polished text
    if (polishType === "Abbreviation" || polishType === "Expansion") {
      return (
        <div className="side-by-side-diff">
          <div className="diff-column">
            <h4>原文</h4>
            <div className="diff-content original">
              {result.original_text}
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="side-by-side-diff">
        <div className="diff-column">
          <h4>原文</h4>
          <div className="diff-content original">
            {result.original_text}
          </div>
        </div>
        <div className="diff-column">
          <h4>润色后</h4>
          <div className="diff-content polished">
            {useHtml ? (
              <div dangerouslySetInnerHTML={{ __html: processedPolishedText }} />
            ) : (
              processedPolishedText
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="paper-polish">
      <h2>论文润色</h2>
      
      {error && (
        <div className="form-group has-error">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="form-group">
        <label>润色类型</label>
        <select 
          value={polishType} 
          onChange={(e) => {
            const newPolishType = e.target.value;
            setPolishType(newPolishType);
            // 当选择翻译类型时自动设置对应的语言
            if (newPolishType === "Translation (Chinese to English)") {
              setLanguage("Chinese");
            } else if (newPolishType === "Translation (English to Chinese)") {
              setLanguage("English");
            }
            // 清空之前的结果和错误
            setResult(null);
            setError('');
          }}
        >
          <option value="Expression Polishing">表达润色</option>
          <option value="Logic Check">逻辑检查</option>
          <option value="Remove AI Flavor">去AI味</option>
          <option value="Translation (Chinese to English)">中文转英文</option>
          <option value="Translation (English to Chinese)">英文转中文</option>
          <option value="Abbreviation">缩写</option>
          <option value="Expansion">扩写</option>
        </select>
      </div>

      <div className="form-group">
        <label>语言</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          {polishType === "Translation (Chinese to English)" ? (
            <option value="Chinese">中文</option>
          ) : polishType === "Translation (English to Chinese)" ? (
            <option value="English">英文</option>
          ) : (
            <>
              <option value="Chinese">中文</option>
              <option value="English">英文</option>
            </>
          )}
        </select>
      </div>

      <div className="form-group">
        <label>输入文本</label>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError('')
          }}
          placeholder={polishType === "Abbreviation" || polishType === "Expansion" ? (language === "Chinese" ? "请输入要处理的中文 LaTeX 代码" : "请输入要处理的英文 LaTeX 代码") : "请输入要润色的文本"}
          rows={10}
        />
      </div>

      <button 
        className="btn"
        onClick={handlePolish}
        disabled={loading || !text.trim()}
      >
        {loading ? '润色中...' : '润色'}
      </button>

      {loading && (
        <div className="loading"></div>
      )}

      {result && (
        <div className="result">
          <h3>润色结果</h3>
          <div className="diff-container">
            {renderDiff()}
          </div>
          {result.modification_log && (
            <div className="modification-log">
              <h4>
                {polishType === "Logic Check" ? "逻辑分析" :
                 polishType === "Remove AI Flavor" ? "AI味分析" :
                 polishType === "Abbreviation" ? "缩写分析" :
                 polishType === "Expansion" ? "扩写分析" : "修改日志"
                }
              </h4>
              <div className="log-content">
                {result.modification_log.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PaperPolish