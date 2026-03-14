import React, { useState, useEffect } from 'react'
import PaperPolish from './components/paper_polish'
import PaperAnalysis from './components/paper_analysis'

function App() {
  const [activeTab, setActiveTab] = useState('polish')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com/v1')
  const [model, setModel] = useState('deepseek-chat')

  // 保存API Key到localStorage
  const saveApiKey = () => {
    localStorage.setItem('apiKey', apiKey)
    localStorage.setItem('baseUrl', baseUrl)
    localStorage.setItem('model', model)
    alert('API Key保存成功！')
  }

  // 从localStorage加载API Key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey')
    const savedBaseUrl = localStorage.getItem('baseUrl')
    const savedModel = localStorage.getItem('model')
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedBaseUrl) setBaseUrl(savedBaseUrl)
    if (savedModel) setModel(savedModel)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'polish':
        return <PaperPolish apiKey={apiKey} baseUrl={baseUrl} model={model} />
      case 'analysis':
        return <PaperAnalysis apiKey={apiKey} baseUrl={baseUrl} model={model} />
      case 'settings':
        return (
          <div className="settings">
            <h2>API设置</h2>
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的API key"
              />
            </div>
            <div className="form-group">
              <label>Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="输入API基础URL"
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="输入模型名称"
              />
            </div>
            <button className="btn" onClick={saveApiKey}>
              保存设置
            </button>
          </div>
        )
      default:
        return <PaperPolish apiKey={apiKey} baseUrl={baseUrl} model={model} />
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>智能学术助手</h1>
        <p>论文润色与文献阅读辅助系统</p>
      </div>
      
      <div className="nav">
        <button 
          className={activeTab === 'polish' ? 'active' : ''}
          onClick={() => setActiveTab('polish')}
        >
          论文润色
        </button>
        <button 
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          文献分析
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          API设置
        </button>
      </div>
      
      <div className="content">
        {renderContent()}
      </div>
    </div>
  )
}

export default App