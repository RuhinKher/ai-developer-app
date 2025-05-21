// src/pages/Login.jsx
import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import { motion } from 'framer-motion'

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { when: 'beforeChildren', staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } }
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const submitHandler = e => {
    e.preventDefault()
    axios
      .post('/users/login', { email, password })
      .then(res => {
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        navigate('/')
      })
      .catch(err => console.log(err.response.data))
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="relative min-h-screen bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#001a2e] overflow-hidden flex items-center justify-center p-10"
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

      <motion.div
        variants={itemVariants}
        className="relative z-10 bg-[#0a0f24] p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white mb-6">
          Login
        </motion.h2>
        <motion.form
          variants={itemVariants}
          onSubmit={submitHandler}
          className="flex flex-col gap-4"
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-gray-400">Email</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
                 id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-[#141c3a] rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none text-white"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-gray-400">Password</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 bg-[#141c3a] rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none text-white"
              required
            />
          </motion.div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="w-full p-3 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg text-white"
            type="submit"
          >
            Login
          </motion.button>
        </motion.form>
        <motion.p variants={itemVariants} className="text-gray-400 mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </motion.main>
)
}

export default Login