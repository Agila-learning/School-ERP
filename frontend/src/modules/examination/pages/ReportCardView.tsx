import { useState, useEffect } from 'react';
import { getExams, getStudentResults } from '../api/examination.api';

const ReportCardView = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExams().then(data => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    const data = await getStudentResults({ examinationId: selectedExamId });
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and view student report cards</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
           <div className="flex space-x-4">
              <select 
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                 <option value="">Select Exam</option>
                 {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
           </div>
           <button onClick={handleSearch} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
             Search
           </button>
        </div>
        
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : results.length === 0 ? (
           <div className="p-8 text-center text-gray-500">No report cards found.</div>
        ) : (
          results.map((res: any) => (
            <div key={res.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 max-w-4xl mx-auto my-6">
              <div className="text-center border-b border-gray-300 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">Global Excellence School</h1>
                <p className="text-gray-500 text-sm mt-1">Academic Year</p>
                <h2 className="text-xl font-bold text-indigo-700 mt-4">REPORT CARD</h2>
              </div>
              
              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <p><span className="font-bold">Student Name:</span> {res.studentName}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-bold">Class & Section:</span> {res.className} - {res.sectionName}</p>
                </div>
              </div>

              <table className="w-full text-sm border-collapse border border-gray-300 mb-8">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Subject</th>
                    <th className="border border-gray-300 p-2 text-center">Max Marks</th>
                    <th className="border border-gray-300 p-2 text-center">Marks Obtained</th>
                    <th className="border border-gray-300 p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {res.subjectResults?.map((sub: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 p-2 font-medium">{sub.subjectName}</td>
                      <td className="border border-gray-300 p-2 text-center">{sub.maxMarks}</td>
                      <td className="border border-gray-300 p-2 text-center">{sub.marksObtained}</td>
                      <td className="border border-gray-300 p-2 text-center font-bold text-emerald-600">{sub.grade}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="border border-gray-300 p-2 text-right">TOTAL</td>
                    <td className="border border-gray-300 p-2 text-center">{res.totalMaxMarks}</td>
                    <td className="border border-gray-300 p-2 text-center">{res.totalObtained}</td>
                    <td className="border border-gray-300 p-2 text-center text-indigo-700">{res.percentage?.toFixed(1)}% ({res.overallGrade})</td>
                  </tr>
                </tfoot>
              </table>

              <div className="flex justify-between mt-16 pt-8 border-t border-gray-200">
                <div className="text-center w-32 border-t border-gray-400 pt-2">Class Teacher</div>
                <div className="text-center w-32 border-t border-gray-400 pt-2">Principal</div>
                <div className="text-center w-32 border-t border-gray-400 pt-2">Parent</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportCardView;
