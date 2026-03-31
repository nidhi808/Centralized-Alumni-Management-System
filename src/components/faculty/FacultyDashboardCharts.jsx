import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Mock data for Faculty view 
const studentProgress = [
  { year: '2020', placed: 40, total: 60 },
  { year: '2021', placed: 55, total: 70 },
  { year: '2022', placed: 70, total: 85 },
  { year: '2023', placed: 90, total: 100 },
  { year: '2024', placed: 110, total: 120 },
];

const engagementStats = [
  { name: 'Mentors', value: 25 },
  { name: 'Job Posters', value: 40 },
  { name: 'Event Speakers', value: 15 },
  { name: 'Inactive', value: 20 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#6b7280']; // Purple, Blue, Green, Gray

export default function FacultyDashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-6">
      {/* Bar Chart: Student Placements Over Years */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-text dark:text-white mb-6 font-display">Department Placement Trends</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={studentProgress}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip
                cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px' }} />
              <Bar dataKey="placed" name="Students Placed" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="total" name="Total Students" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Alumni Engagement */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
        <h3 className="text-lg font-bold text-text dark:text-white mb-6 w-full text-left font-display">Alumni Engagement Breakdown</h3>
        <div className="h-72 w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={engagementStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {engagementStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                 itemStyle={{ color: '#fff', fontWeight: 500 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
