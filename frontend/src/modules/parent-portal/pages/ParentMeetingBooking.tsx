import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, DatePicker, TimePicker, Input, Tag, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

export const ParentMeetingBooking: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data for dropdowns
  const students = [{ id: '1', name: 'John Doe' }];
  const teachers = [{ id: '1', name: 'Mr. Smith (Math)' }, { id: '2', name: 'Mrs. Johnson (Science)' }];

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/communication/meetings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': localStorage.getItem('tenantId') || '' }
      });
      const data = await response.json();
      if (data.success) {
        setMeetings(data.data);
      }
    } catch (error) {
      message.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      const payload = { 
        ...values, 
        date: values.date.toISOString(),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm')
      };

      const response = await fetch('/api/v1/communication/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || ''
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        message.success('Meeting requested successfully');
        setIsModalVisible(false);
        fetchMeetings();
      } else {
        message.error(data.message || 'Operation failed');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  const columns = [
    { title: 'Teacher', dataIndex: ['teacherId', 'firstName'], key: 'teacher', render: (text: string, record: any) => `${text} ${record.teacherId?.lastName || ''}` },
    { title: 'Student', dataIndex: ['studentId', 'firstName'], key: 'student', render: (text: string, record: any) => `${text} ${record.studentId?.lastName || ''}` },
    { 
      title: 'Date & Time', 
      key: 'datetime',
      render: (_: any, record: any) => (
        <span>{dayjs(record.date).format('MMM DD, YYYY')} ({record.startTime} - {record.endTime})</span>
      )
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'CONFIRMED') color = 'green';
        if (status === 'CANCELLED') color = 'red';
        if (status === 'COMPLETED') color = 'gray';
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Meetings</h1>
        <Button type="primary" icon={<CalendarOutlined />} onClick={() => setIsModalVisible(true)}>
          Request Meeting
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={meetings} 
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title="Request Parent-Teacher Meeting"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="studentId" label="Select Child" rules={[{ required: true }]}>
            <Select>
              {students.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="teacherId" label="Select Teacher" rules={[{ required: true }]}>
            <Select>
              {teachers.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="date" label="Preferred Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" disabledDate={current => current && current < dayjs().startOf('day')} />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]} className="flex-1">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
            <Form.Item name="endTime" label="End Time" rules={[{ required: true }]} className="flex-1">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="reason" label="Reason for Meeting" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button onClick={handleCancel} className="mr-2">Cancel</Button>
            <Button type="primary" htmlType="submit">Submit Request</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ParentMeetingBooking;
