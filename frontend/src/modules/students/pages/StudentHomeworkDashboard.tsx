import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';

export const StudentHomeworkDashboard: React.FC = () => {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      // In a real scenario, the backend route would filter by the logged-in student's class
      const response = await fetch('/api/v1/academic/homework', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': localStorage.getItem('tenantId') || '' }
      });
      const data = await response.json();
      if (data.success) {
        setHomeworks(data.data);
      }
    } catch (error) {
      message.error('Failed to load homeworks');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Subject', dataIndex: ['subjectId', 'name'], key: 'subject' },
    { title: 'Teacher', key: 'teacher', render: (_: any, record: any) => `${record.teacherId?.firstName || ''} ${record.teacherId?.lastName || ''}` },
    { 
      title: 'Due Date', 
      dataIndex: 'dueDate', 
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        const isPastDue = dayjs().isAfter(dayjs(record.dueDate));
        return (
          <Tag color={isPastDue ? 'red' : 'green'}>{isPastDue ? 'Past Due' : 'Active'}</Tag>
        );
      }
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Homework</h1>
      <Card>
        <Table 
          columns={columns} 
          dataSource={homeworks} 
          rowKey="_id"
          loading={loading}
          expandable={{
            expandedRowRender: record => <p style={{ margin: 0 }}>{record.description}</p>,
          }}
        />
      </Card>
    </div>
  );
};

export default StudentHomeworkDashboard;
