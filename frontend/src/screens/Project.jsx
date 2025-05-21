import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'
import { motion, AnimatePresence } from 'framer-motion'

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)
  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])
  return <code {...props} ref={ref} />
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { when: 'beforeChildren', staggerChildren: 0.1 } }
}

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [projectsUsers] = useState(location.state.project.users)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const messageBox = useRef(null)

  function handleUserClick(id) {
    setSelectedUserId(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addCollaborators() {
    axios.put('/projects/add-user', {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then(() => setIsModalOpen(false))
     .catch(() => {})
  }

  useEffect(() => {
    if (messageBox.current) messageBox.current.scrollTop = messageBox.current.scrollHeight
  }, [messages])

  const send = () => {
  
    if (!message.trim()) return
    setMessages(prev => [...prev, { sender: user, message }])
sendMessage('project-message', { message, sender: user })
    setMessage('')
    axios.post(`/api/chat/${project._id}`, {
      sender: user.email,
      content: message,
      isAI: false
    }).catch(() => {})
  }

  function WriteAiMessage(msg) {
    const m = JSON.parse(msg)
    return (
      <div className="p-3 bg-[#141c3a] text-white rounded-lg overflow-auto">
        <Markdown
          children={m.text}
          options={{ overrides: { code: SyntaxHighlightedCode } }}
        />
      </div>
    )
  }

  useEffect(() => {
    initializeSocket(project._id)
    if (!webContainer) {
      getWebContainer().then(c => setWebContainer(c))
    }
    receiveMessage('project-message', data => {
      if (data.sender._id === 'ai') {
        const parsed = JSON.parse(data.message)
        webContainer?.mount(parsed.fileTree)
        if (parsed.fileTree) setFileTree(parsed.fileTree)
        setMessages(prev => [...prev, data])
        axios.post(`/api/chat/${project._id}`, {
          sender: 'ai',
          content: String(data.message),
          isAI: true
        }).catch(() => {})
     } else if (data.sender._id !== user._id) {
            // only append if it's _not_ your own message
            setMessages(prev => [...prev, data])
          }
    })
    axios.get(`/projects/get-project/${project._id}`)
      .then(res => {
        setProject(res.data.project)
        setFileTree(res.data.project.fileTree || {})
      })
    axios.get('/users/all')
      .then(res => setUsers(res.data.users))
      .catch(() => {})
  }, [project._id, webContainer])

  useEffect(() => {
    axios.get(`/api/chat/${project._id}`)
      .then(res => {
        const normalized = (res.data || []).map(msg => ({
          sender: msg.isAI ? { _id: 'ai', email: 'AI Assistant' } : { _id: null, email: msg.sender },
          message: msg.content
        }))
        setMessages(normalized)
      })
      .catch(() => {})
  }, [project._id, webContainer])

  function saveFileTree(ft) {
    axios.put('/projects/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    }).catch(() => {})
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="relative min-h-screen bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#001a2e] overflow-hidden flex"
    >
      <motion.div
        className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#0057e7] rounded-full filter blur-3xl opacity-40"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-[#009ffd] rounded-full filter blur-2xl opacity-30"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      />

<section className="relative flex-none flex flex-col h-screen w-1/3 bg-[#0a0f24]">
        <header className="flex justify-between items-center px-6 py-4 bg-[#141c3a] text-white">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-blue-300">
            <i className="ri-add-fill text-lg"></i>
            Add Collaborator
          </button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="text-blue-300 p-2">
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>
        <div className="flex-grow pt-20 pb-16 overflow-auto px-4" ref={messageBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[60%] mb-4 p-3 rounded-lg ${
                msg.sender._id === 'ai' ? 'bg-[#141c3a] text-white' : 'bg-[#0057e7] text-white ml-auto'
              }`}
            >
              <small className="block text-gray-400 mb-1">{msg.sender.email}</small>
              {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 w-full flex">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-3 bg-[#141c3a] text-white outline-none border-none"
          />
          <button onClick={send} className="px-6 bg-gradient-to-br from-blue-600 to-blue-400 text-white">
            <i className="ri-send-plane-fill text-xl"></i>
          </button>
        </div>
        <AnimatePresence>
          {isSidePanelOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 left-0 h-full w-full bg-[#141c3a] flex flex-col"
            >
              <header className="flex justify-between items-center px-6 py-4 bg-[#0f1a33] text-white">
                <h2 className="text-lg font-semibold">Collaborators</h2>
                <button onClick={() => setIsSidePanelOpen(false)} className="text-blue-300 p-2">
                  <i className="ri-close-fill text-xl"></i>
                </button>
              </header>
              <div className="flex-grow overflow-auto p-4 space-y-3">
                {project.users.map(u => (
                  <div key={u._id} className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-[#0057e7] rounded-full flex items-center justify-center text-white">
                      <i className="ri-user-fill"></i>
                    </div>
                    <span>{u.email}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="flex-grow flex overflow-hidden">
        <div className="w-64 bg-[#0a192f] overflow-auto">
          {Object.keys(fileTree).map((file, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentFile(file)
                setOpenFiles([...new Set([...openFiles, file])])
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#141c3a] text-white"
            >
              {file}
            </button>
          ))}
        </div>
        <div className="flex-grow flex flex-col">
          <div className="flex border-b border-[#141c3a] bg-[#0a0f24]">
            {openFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentFile(file)}
                className={`px-4 py-2 ${
                  currentFile === file ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white' : 'text-white'
                }`}
              >
                {file}
              </button>
            ))}
          </div>
          <div className="flex-grow bg-[#141c3a] overflow-auto p-4">
            {currentFile && (
              <pre className="hljs">
                <code
                  className="hljs"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const updated = e.target.innerText
                    const ft = {
                      ...fileTree,
                      [currentFile]: { file: { contents: updated } }
                    }
                    setFileTree(ft)
                    saveFileTree(ft)
                  }}
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value
                  }}
                />
              </pre>
            )}
          </div>
        </div>
        {/* {webContainer && (
          <div className="w-96 flex flex-col bg-[#0a0f24]">
            <input
              type="text"
              value={webContainer.url || ''}
              onChange={e => setIframeUrl(e.target.value)}
              className="p-3 bg-[#141c3a] text-white outline-none"
            />
            <iframe src={webContainer.url} className="flex-grow" />
          </div>
        )} */}
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#0a0f24] p-6 rounded-2xl w-80 text-white"
            >
              <header className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select Users</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-blue-300">
                  <i className="ri-close-fill text-xl"></i>
                </button>
              </header>
              <div className="max-h-64 overflow-auto space-y-3 mb-4">
                {users.map(u => (
                  <div
                    key={u._id}
                    onClick={() => handleUserClick(u._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                      selectedUserId.has(u._id) ? 'bg-[#0057e7]' : 'bg-[#141c3a]'
                    }`}
                  >
                    <div className="w-8 h-8 bg-[#0057e7] rounded-full flex items-center justify-center text-white">
                      <i className="ri-user-fill"></i>
                    </div>
                    <span>{u.email}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={addCollaborators}
                className="w-full py-3 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg text-white"
              >
                Add Collaborators
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}

export default Project
