
const ResultsDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results & Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Calculate results, publish, and manage promotions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="font-semibold text-gray-900">1. Calculate Results</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Process locked marks sheets and generate grades/GPA.</p>
            <button className="mt-auto px-4 py-2 w-full border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-medium">Calculate</button>
         </div>

         <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            </div>
            <h3 className="font-semibold text-gray-900">2. Approve & Publish</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Review calculated results and publish to students/parents.</p>
            <button className="mt-auto px-4 py-2 w-full border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 text-sm font-medium">Review Results</button>
         </div>

         <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <h3 className="font-semibold text-gray-900">3. Process Promotions</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Run promotion engine on published results for the academic year.</p>
            <button className="mt-auto px-4 py-2 w-full border border-green-600 text-green-600 rounded-md hover:bg-green-50 text-sm font-medium">Process</button>
         </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
