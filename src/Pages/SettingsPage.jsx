

const SettingsPage = () => {
  return (
    <div className="relative min-h-screen bg-white p-4">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10 pointer-events-none z-0"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Settings</h1>
        {/* Settings content goes here */}
      </div>
    </div>
  );
}
export default SettingsPage;