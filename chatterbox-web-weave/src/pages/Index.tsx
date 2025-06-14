
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">I'm Working!</h1>
          <p className="text-lg text-gray-600 mb-4">Your app is running perfectly</p>
        </div>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• React ✓</p>
          <p>• Tailwind CSS ✓</p>
          <p>• TypeScript ✓</p>
          <p>• All systems operational</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
