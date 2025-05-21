import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import { FaPlus, FaUserFriends } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
}

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const modalContent = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  exit: { opacity: 0, scale: 0.8 }
}

const Home = () => {
  const { User } = useContext(UserContext)
  const [projects, setProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/projects/all').then(res => setProjects(res.data.projects)).catch(() => {})
  }, [])

  const createProject = e => {
    e.preventDefault()
    axios.post('/projects/create', { name: projectName })
      .then(res => {
        setProjects(prev => [...prev, res.data.project])
        setProjectName('')
        setIsModalOpen(false)
      })
      .catch(() => {})
  }

  return (
    <motion.main initial="hidden" animate="visible" className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden p-10 font-sans text-white">
      <motion.div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600 rounded-full filter blur-3xl opacity-40" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} />
      <motion.div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-500 rounded-full filter blur-2xl opacity-30" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }} />

      <motion.button
        onClick={() => navigate('/code-review')}
        className="absolute top-5 right-6 px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Review
      </motion.button>

      <motion.div variants={containerVariants} className="flex flex-wrap gap-6 justify-center mt-20">
        <motion.button
          onClick={() => setIsModalOpen(true)}
          variants={itemVariants}
          className="w-52 h-48 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white text-lg font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus className="text-5xl mb-2" />
          NEW PROJECT
        </motion.button>

        {projects.map(project => (
          <motion.div
            key={project._id}
            onClick={() => navigate('/project', { state: { project } })}
            variants={itemVariants}
            className="cursor-pointer w-52 h-48 bg-[#1e1e2f] rounded-2xl p-6 flex flex-col justify-between shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0px 20px 30px rgba(0,0,0,0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <h2 className="text-xl font-semibold truncate">{project.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaUserFriends className="text-purple-400" />
              <span>Collaborators {project.users.length}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#1e1e2f] p-8 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-5">Create New Project</h2>
              <form onSubmit={createProject} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full p-3 bg-[#141423] rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
                <div className="flex justify-end gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-700 rounded-md text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 rounded-md text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}

export default Home
