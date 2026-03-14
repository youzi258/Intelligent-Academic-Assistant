import React, { useState } from 'react'
import axios from 'axios'

function PaperAnalysis({ apiKey, baseUrl, model }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedContent, setSelectedContent] = useState('')
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
      if (['pdf', 'docx'].includes(fileExtension)) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('请上传PDF或DOCX格式的文件')
        setFile(null)
      }
    }
  }

  const handleAnalysis = async () => {
    console.log('handleAnalysis called')
    if (!file) {
      console.log('No file selected')
      setError('请先选择文件')
      return
    }
    
    if (!apiKey) {
      console.log('No API key configured')
      setError('请先在API设置中配置API密钥')
      return
    }
    
    console.log('File selected:', file.name)
    console.log('API Key:', apiKey)
    console.log('Base URL:', baseUrl)
    console.log('Model:', model)
    
    setError('')
    setResult(null) // 清除之前的分析结果
    setSelectedContent('') // 清除之前的内容解释问题
    setExplanation('') // 清除之前的内容解释回答
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('base_url', baseUrl)
      formData.append('model', model)
      
      console.log('Sending API request to /api/paper-analysis')
      const response = await axios.post('/api/paper-analysis/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('API response received:', response.data)
      setResult(response.data)
    } catch (error) {
      console.error('Analysis failed:', error)
      console.error('Error response:', error.response)
      setError('分析失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
      console.log('Analysis completed')
    }
  }

  const handleExplain = async () => {
    if (!selectedContent) {
      setError('请输入需要解释的内容')
      return
    }
    
    if (!result) {
      setError('请先分析论文')
      return
    }
    
    setError('')
    setExplanation('') // 清除之前的解释结果
    setExplaining(true)
    try {
      // 直接使用已有的分析结果，避免重新上传文件和分析
      const explainResponse = await axios.post('/api/paper-analysis/explain-content/', {
        text: result.abstract + ' ' + result.methodology + ' ' + result.results + ' ' + result.conclusion,
        content: selectedContent,
        api_key: apiKey,
        base_url: baseUrl,
        model: model
      })
      
      setExplanation(explainResponse.data)
    } catch (error) {
      console.error('Explanation failed:', error)
      setError('解释失败: ' + (error.message || '未知错误'))
    } finally {
      setExplaining(false)
    }
  }

  return (
    <div className="paper-analysis">
      <h2>文献分析</h2>
      
      {error && (
        <div className="form-group has-error">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="form-group">
        <label>上传文件</label>
        <div className="file-upload">
          <input 
            type="file" 
            accept=".pdf,.docx" 
            onChange={handleFileChange}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            {file ? '更换文件' : '点击或拖拽文件到此处上传'}
          </label>
          {file && <div className="file-name">已选择文件: {file.name}</div>}
        </div>
      </div>

      <button 
        className="btn"
        onClick={handleAnalysis}
        disabled={loading || !file}
      >
        {loading ? '分析中...' : '分析'}
      </button>

      {loading && (
        <div className="loading"></div>
      )}

      {result && (
        <div className="result">
          <h3>分析结果</h3>
          
          <div className="result-item">
            <h4>标题</h4>
            <p>{result.title}</p>
          </div>
          
          <div className="result-item">
            <h4>作者</h4>
            <p>{result.authors}</p>
          </div>
          
          <div className="result-item">
            <h4>摘要</h4>
            <p>{result.abstract}</p>
          </div>
          
          <div className="result-item">
            <h4>研究方法</h4>
            <p>{result.methodology}</p>
          </div>
          
          <div className="result-item">
            <h4>研究结果</h4>
            <p>{result.results}</p>
          </div>
          
          <div className="result-item">
            <h4>结论</h4>
            <p>{result.conclusion}</p>
          </div>
          
          <div className="result-item">
            <h4>关键词</h4>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {result.key_terms.map((term, index) => (
                <span key={index} style={{ 
                  backgroundColor: 'rgba(102, 126, 234, 0.1)', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.9rem',
                  color: '#667eea',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  {term}
                </span>
              ))}
            </div>
          </div>
          
          <div className="result-item">
            <h4>文献大纲</h4>
            <div className="outline">
              {result.outline.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          

          
          <div className="content-explanation">
            <h4>内容解释</h4>
            <div className="form-group">
              <label>输入需要解释的内容</label>
              <textarea
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                placeholder="输入需要解释的论文内容..."
                rows={3}
              />
            </div>
            <button 
              className="btn"
              onClick={handleExplain}
              disabled={explaining || !selectedContent}
            >
              {explaining ? '解释中...' : '解释内容'}
            </button>
            {explaining && (
              <div className="loading"></div>
            )}
            {explanation && (
              <div className="explanation-result">
                <h5>解释结果</h5>
                <div className="explanation-content">
                  {explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaperAnalysis