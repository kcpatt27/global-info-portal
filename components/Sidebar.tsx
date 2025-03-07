const Sidebar = () => (
  <motion.nav 
    initial={{ x: -100 }}
    animate={{ x: 0 }}
    className="w-20 hover:w-64 transition-all duration-300 h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-4">
    <div className="flex flex-col space-y-6">
      <button className="p-3 rounded-lg hover:bg-slate-700 transition-colors">
        <Search className="text-slate-100 w-6 h-6" />
      </button>
      {/* other buttons */}
    </div>
  </motion.nav>
) 