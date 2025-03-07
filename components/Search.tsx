import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SearchBar = () => {
  const [input, setInput] = useState('')
  
  return (
    <div className="relative max-w-xl mx-auto">
      <input
        className="w-full bg-slate-100/10 backdrop-blur-lg rounded-full px-6 py-3 transition-all duration-300 focus:w-[120%] focus:ring-2 ring-blue-400"
        onChange={(e) => setInput(e.target.value)}
      />
      <AnimatePresence>
        {input.length > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute mt-2 w-full bg-slate-800 rounded-lg p-4">
            {/* suggestions */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar 